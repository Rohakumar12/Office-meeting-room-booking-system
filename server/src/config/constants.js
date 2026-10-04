// Office hours configuration (24h format)
const OFFICE_HOURS = {
  start: '08:00',
  end: '20:00',
  workDays: [1, 2, 3, 4, 5], // Monday = 1, Friday = 5
};

// ---------------------------------------------------------------------------
// Token lifetimes
//
// The access token is deliberately short lived so a leaked one is only useful
// for minutes. The refresh token is long lived, opaque, revocable and stored
// hashed, so it is the only thing that can mint new access tokens.
// ---------------------------------------------------------------------------
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ms -> compact string that `jsonwebtoken` understands ("15m", "1h", "7d")
const msToJwtExpiry = (ms) => `${Math.round(ms / 60000)}m`;

// The inverse, so the cookie can never outlive - or underlive - the token it
// carries. Supports the units people actually write in .env.
const DURATION_UNITS = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
const parseDuration = (value) => {
  const match = /^(\d+)\s*([smhd])$/.exec(String(value).trim());
  return match ? Number(match[1]) * DURATION_UNITS[match[2]] : null;
};

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expire: process.env.JWT_EXPIRE || msToJwtExpiry(ACCESS_TOKEN_TTL_MS),
};

const REFRESH_CONFIG = {
  expireMs:
    (parseInt(process.env.REFRESH_TOKEN_TTL_DAYS, 10) || 7) * 24 * 60 * 60 * 1000,
};

// If JWT_EXPIRE was overridden, the access cookie has to follow it, otherwise
// the cookie would expire early and sign the user out mid-session.
const accessCookieTtl =
  parseDuration(process.env.JWT_EXPIRE) || parseDuration(JWT_CONFIG.expire);

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
};

// Access token: short lived, sent with every API request.
const ACCESS_COOKIE_CONFIG = {
  ...baseCookie,
  path: '/',
  maxAge: accessCookieTtl,
};

// Refresh token: long lived and scoped to the auth routes, so it is not
// attached to ordinary API calls.
const REFRESH_COOKIE_CONFIG = {
  ...baseCookie,
  path: '/api/auth',
  maxAge: REFRESH_CONFIG.expireMs,
};

// "Keep me signed in" unticked: no maxAge, so both cookies are discarded when
// the browser closes.
const ACCESS_SESSION_COOKIE_CONFIG = { ...baseCookie, path: '/' };
const REFRESH_SESSION_COOKIE_CONFIG = { ...baseCookie, path: '/api/auth' };

/** Clear a cookie regardless of the settings it was set with. */
const clearCookieConfig = (path) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path,
  expires: new Date(0),
});

// Aliases kept so existing imports of the old names still resolve.
const COOKIE_CONFIG = ACCESS_COOKIE_CONFIG;
const SESSION_COOKIE_CONFIG = ACCESS_SESSION_COOKIE_CONFIG;

// Booking status enum
const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

// User roles
const USER_ROLES = {
  EMPLOYEE: 'employee',
  ADMIN: 'admin',
};

// Pagination defaults
const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 10,
  maxLimit: 100,
};

// Available time slots (30-minute intervals)
const TIME_SLOTS = [];
for (let hour = 8; hour < 20; hour++) {
  TIME_SLOTS.push(`${String(hour).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(hour).padStart(2, '0')}:30`);
}
TIME_SLOTS.push('20:00');

// Common amenities
const AMENITIES = [
  'Projector',
  'Whiteboard',
  'TV',
  'Video Conferencing',
  'WiFi',
  'Air Conditioning',
  'Conference Phone',
  'Flip Chart',
  'Laser Pointer',
  'Coffee Machine',
];

module.exports = {
  OFFICE_HOURS,
  JWT_CONFIG,
  REFRESH_CONFIG,
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
  COOKIE_CONFIG,
  SESSION_COOKIE_CONFIG,
  ACCESS_COOKIE_CONFIG,
  ACCESS_SESSION_COOKIE_CONFIG,
  REFRESH_COOKIE_CONFIG,
  REFRESH_SESSION_COOKIE_CONFIG,
  clearCookieConfig,
  BOOKING_STATUS,
  USER_ROLES,
  PAGINATION,
  TIME_SLOTS,
  AMENITIES,
};