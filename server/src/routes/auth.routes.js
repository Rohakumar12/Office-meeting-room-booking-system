const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authIpLimiter, authAccountLimiter } = require('../middleware/rateLimiter');
const { registerSchema, loginSchema } = require('../validators/authValidators');

// Two layers, because they catch different attacks:
//   authIpLimiter      -> bulk attempts from a single source
//   authAccountLimiter -> credential stuffing spread across many IPs
// Both only count failures, so legitimate use is never throttled.
const authLimits = [authIpLimiter, authAccountLimiter];

router.post('/register', ...authLimits, validate(registerSchema), register);
router.post('/login', ...authLimits, validate(loginSchema), login);

// Silent re-authentication. Rate limited by IP only - there is no account
// identifier to key on, and it is already gated by a 384-bit secret.
router.post('/refresh', authIpLimiter, refresh);

// Unauthenticated on purpose: an expired access token must not block logout.
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
