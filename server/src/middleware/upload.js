const fs = require("fs");
const path = require("path");
const multer = require("multer");
const ApiError = require("../utils/ApiError");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "public", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, UPLOAD_DIR);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase() || ".jpg";
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 40) || "image";
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${baseName}-${uniqueName}${extension}`);
  },
});

const fileFilter = (req, file, callback) => {
  if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
    return callback(
      new ApiError(400, "Only JPG, PNG, WEBP, and GIF images are allowed"),
    );
  }

  return callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

const uploadAvatar = upload.single("avatar");
const uploadRoomImage = upload.single("image");

module.exports = {
  UPLOAD_DIR,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  uploadAvatar,
  uploadRoomImage,
};
