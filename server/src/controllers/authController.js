const authService = require('../services/authService');
const ApiResponse = require('../utils/ApiResponse');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    await authService.sendTokenResponse(user, 201, res, 'Registration successful', {
      rememberMe: req.body.rememberMe,
      userAgent: req.get('user-agent') || '',
      ip: req.ip,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await authService.login(email, password);
    await authService.sendTokenResponse(user, 200, res, 'Login successful', {
      rememberMe,
      userAgent: req.get('user-agent') || '',
      ip: req.ip,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Exchange the refresh cookie for a new token pair.
 *
 * Deliberately unauthenticated - the refresh token itself is the credential.
 * The old token is rotated out on every call.
 */
const refresh = async (req, res, next) => {
  try {
    const rawToken = req.cookies && req.cookies.refreshToken;

    const { user, refreshToken, rememberMe } = await authService.rotateRefreshToken(
      rawToken,
      { userAgent: req.get('user-agent') || '', ip: req.ip }
    );

    await authService.sendRefreshResponse(user, res, { refreshToken, rememberMe });
  } catch (error) {
    // A rejected refresh token is worthless - make sure the browser stops
    // sending it, otherwise it will keep retrying on every 401.
    authService.clearAuthCookies(res);
    next(error);
  }
};

/**
 * Log out.
 *
 * Not protected: a client whose access token has just expired still needs to be
 * able to log out and clear its cookies.
 */
const logout = async (req, res, next) => {
  try {
    const rawToken = req.cookies && req.cookies.refreshToken;

    await authService.revokeRefreshToken(rawToken);
    authService.clearAuthCookies(res);

    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Logged out successfully'));
  } catch (error) {
    // Never let a logout failure leave cookies in place.
    authService.clearAuthCookies(res);
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    return res.status(200).json(new ApiResponse(200, { user }, 'User profile retrieved'));
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout, getMe };
