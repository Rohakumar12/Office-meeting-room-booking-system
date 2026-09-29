const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
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
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
