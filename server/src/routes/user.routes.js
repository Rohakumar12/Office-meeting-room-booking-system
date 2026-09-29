const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/upload");
const { uploadLimiter } = require("../middleware/rateLimiter");
const { uploadProfileImage } = require("../controllers/userController");

// uploadLimiter runs before multer so rejected requests never touch disk.
router.post("/profile-image", protect, uploadLimiter, uploadAvatar, uploadProfileImage);

module.exports = router;
