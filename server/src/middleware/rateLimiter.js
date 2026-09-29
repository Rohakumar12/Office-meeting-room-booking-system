const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';

/** Read a positive integer from the environment, falling back to a default. */
const num = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const minutes = (m) => m * 60 * 1000;

const standard = {
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
};

/**
 * 1. General API - every /api request, keyed by IP.
 *
 * A single page load fans out into several calls (/auth/me, /rooms,
 * /bookings, ...) and React StrictMode doubles effects in development, so this
 * sits well above normal usage. Its job is to absorb abuse and runaway
 * clients, not to police authentication.
 */
const apiLimiter = rateLimit({
  windowMs: num(process.env.RATE_LIMIT_WINDOW_MS, minutes(15)),
  max: num(process.env.RATE_LIMIT_MAX, 300),
  ...standard,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

/**
 * 2. Authentication attempts per IP.
 *
 * Only *failed* attempts consume the budget (skipSuccessfulRequests), so a real
 * user who signs in, signs out and signs back in is never locked out.
 */
const authIpLimiter = rateLimit({
  windowMs: num(process.env.AUTH_RATE_LIMIT_WINDOW_MS, minutes(15)),
  max: num(process.env.AUTH_RATE_LIMIT_MAX, 20),
  skipSuccessfulRequests: true,
  ...standard,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
  },
});

/**
 * 3. Authentication attempts per account (email).
 *
 * Catches credential stuffing spread across many source IPs, which the per-IP
 * limiter above cannot see. Keyed on the submitted email only - deliberately
 * NOT combined with the IP, because doing so would require IPv6 subnet
 * handling that this version of express-rate-limit does not expose.
 *
 * Trade-off: an attacker who knows a victim's email can deliberately burn this
 * budget and temporarily block that one account. That is a nuisance, not a
 * data breach, and the window is short.
 */
const authAccountLimiter = rateLimit({
  windowMs: num(process.env.AUTH_ACCOUNT_LIMIT_WINDOW_MS, minutes(15)),
  max: num(process.env.AUTH_ACCOUNT_LIMIT_MAX, 10),
  skipSuccessfulRequests: true,
  ...standard,
  keyGenerator: (req) => {
    const email = req.body?.email;
    // Malformed requests all share one bucket; the API limiter still covers them.
    return typeof email === 'string' && email.trim()
      ? email.trim().toLowerCase()
      : '__missing_email__';
  },
  message: {
    success: false,
    message: 'Too many attempts for this account. Please try again in 15 minutes.',
  },
});

/**
 * 4. Image uploads (profile photo, room photo).
 *
 * These are the expensive endpoints: they consume CPU for multer, a temp file
 * on disk, and outbound bandwidth to Cloudinary. Kept low and windowed hourly.
 */
const uploadLimiter = rateLimit({
  windowMs: num(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS, minutes(60)),
  max: num(process.env.UPLOAD_RATE_LIMIT_MAX, 20),
  ...standard,
  message: {
    success: false,
    message: 'Too many upload attempts. Please try again later.',
  },
});

/**
 * NOTE FOR SCALING: every limiter here uses the default in-memory store, so
 * counters reset when the process restarts and are NOT shared between
 * instances. That is fine for a single-instance deployment. If you scale to
 * more than one instance, move to a shared store (e.g. rate-limit-redis),
 * otherwise the effective limit multiplies by the instance count.
 */
module.exports = { apiLimiter, authIpLimiter, authAccountLimiter, uploadLimiter };
