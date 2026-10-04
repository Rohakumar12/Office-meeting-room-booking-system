const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const ApiError = require('../utils/ApiError');
const {
  JWT_CONFIG,
  REFRESH_CONFIG,
  ACCESS_COOKIE_CONFIG,
  ACCESS_SESSION_COOKIE_CONFIG,
  REFRESH_COOKIE_CONFIG,
  REFRESH_SESSION_COOKIE_CONFIG,
  clearCookieConfig,
} = require('../config/constants');

/* ------------------------------------------------------------------ tokens */

/** Short lived JWT that authorises API calls. */
const generateAccessToken = (userId) =>
  jwt.sign({ id: userId, typ: 'access' }, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expire,
  });

/**
 * Opaque, high entropy refresh token.
 *
 * 48 random bytes (384 bits) makes guessing infeasible, so a plain SHA-256
 * hash is sufficient here - a slow KDF like bcrypt is only needed for
 * low-entropy, guessable secrets such as passwords.
 */
const generateRefreshToken = () => crypto.randomBytes(48).toString('hex');

const hashRefreshToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

/* ------------------------------------------------------------------ cookies */

const setAuthCookies = (res, { accessToken, refreshToken, rememberMe }) => {
  const persistent = rememberMe !== false;

  res.cookie(
    'accessToken',
    accessToken,
    persistent ? ACCESS_COOKIE_CONFIG : ACCESS_SESSION_COOKIE_CONFIG
  );
  res.cookie(
    'refreshToken',
    refreshToken,
    persistent ? REFRESH_COOKIE_CONFIG : REFRESH_SESSION_COOKIE_CONFIG
  );
};

const clearAuthCookies = (res) => {
  res.cookie('accessToken', '', clearCookieConfig('/'));
  res.cookie('refreshToken', '', clearCookieConfig('/api/auth'));
  // the pre-refresh cookie name, so old sessions are cleaned up too
  res.cookie('token', '', clearCookieConfig('/'));
};

/* ------------------------------------------------------------ token records */

const persistRefreshToken = async ({
  userId,
  rawToken,
  rememberMe,
  userAgent = '',
  ip = '',
}) => {
  // The database record always gets the full lifetime. Whether the browser
  // keeps it across restarts is decided by the cookie, not by this row.
  await RefreshToken.create({
    user: userId,
    tokenHash: hashRefreshToken(rawToken),
    expiresAt: new Date(Date.now() + REFRESH_CONFIG.expireMs),
    rememberMe: rememberMe !== false,
    userAgent,
    ip,
  });
};

/** Revoke every refresh token belonging to a user (logout, deactivation). */
const revokeAllForUser = async (userId) => {
  await RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
};

/**
 * Exchange a refresh token for a new pair.
 *
 * The presented token is revoked and a fresh one issued (rotation), so a
 * stolen token is only usable once. If an already-revoked token is presented
 * it means either reuse or theft, so every session for that user is killed.
 */
const rotateRefreshToken = async (rawToken, meta = {}) => {
  if (!rawToken) {
    throw new ApiError(401, 'No refresh token provided');
  }

  const tokenHash = hashRefreshToken(rawToken);
  const record = await RefreshToken.findOne({ tokenHash });

  if (!record) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  if (record.revokedAt) {
    // Reuse of a rotated token - treat as compromise.
    await revokeAllForUser(record.user);
    throw new ApiError(401, 'Refresh token reuse detected. Please sign in again.');
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    throw new ApiError(401, 'Refresh token expired. Please sign in again.');
  }

  const user = await User.findById(record.user).select('-password');

  if (!user) {
    throw new ApiError(401, 'User no longer exists.');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact admin.');
  }

  record.revokedAt = new Date();
  await record.save();

  const newRawToken = generateRefreshToken();
  // Carry the original "Keep me signed in" choice forward, otherwise a refresh
  // would silently upgrade a browser-session login into a persistent one.
  const rememberMe = record.rememberMe !== false;
  await persistRefreshToken({
    userId: user._id,
    rawToken: newRawToken,
    rememberMe,
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  return { user, refreshToken: newRawToken, rememberMe };
};

/* ---------------------------------------------------------------- responses */

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  employeeId: user.employeeId,
  avatar: user.avatar || null,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

/**
 * Issue a fresh token pair and send it via HTTP-only cookies.
 *
 * options.rememberMe === false -> session cookies (discarded when the browser
 * closes). The access token is also echoed in the body for non-browser API
 * clients; the browser app relies on the cookies and ignores it.
 */
const sendTokenResponse = async (user, statusCode, res, message, options = {}) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken();

  await persistRefreshToken({
    userId: user._id,
    rawToken: refreshToken,
    rememberMe: options.rememberMe,
    userAgent: options.userAgent,
    ip: options.ip,
  });

  setAuthCookies(res, { accessToken, refreshToken, rememberMe: options.rememberMe });

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: publicUser(user),
      token: accessToken,
      expiresIn: JWT_CONFIG.expire,
    },
  });
};

/**
 * Respond to a successful refresh: a new access token plus the rotated refresh
 * token, both set as cookies using the persistence the user originally chose.
 */
const sendRefreshResponse = async (user, res, { refreshToken, rememberMe }) => {
  const accessToken = generateAccessToken(user._id);

  setAuthCookies(res, { accessToken, refreshToken, rememberMe });

  return res.status(200).json({
    success: true,
    message: 'Session refreshed',
    data: {
      user: publicUser(user),
      token: accessToken,
      expiresIn: JWT_CONFIG.expire,
    },
  });
};

/** Revoke a single refresh token, if it exists. Used on logout. */
const revokeRefreshToken = async (rawToken) => {
  if (!rawToken) return;
  await RefreshToken.updateOne(
    { tokenHash: hashRefreshToken(rawToken), revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
};

/* ----------------------------------------------------------------- accounts */
const register = async ({ name, email, password, department, employeeId }) => {
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  if (employeeId) {
    const existingEmpId = await User.findOne({ employeeId });
    if (existingEmpId) {
      throw new ApiError(409, 'This employee ID is already registered');
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    department,
    employeeId,
    role: 'employee',
  });

  return user;
};

const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact admin.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return user;
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

module.exports = {
  register,
  login,
  getMe,
  publicUser,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  sendTokenResponse,
  sendRefreshResponse,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForUser,
  clearAuthCookies,
};