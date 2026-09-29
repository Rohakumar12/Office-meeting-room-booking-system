const fs = require("fs");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Remove the temporary file created by Multer after the upload attempt.
 * ENOENT is ignored so cleanup is safe to call more than once.
 */
const removeLocalFile = (localFilePath) =>
  new Promise((resolve) => {
    fs.unlink(localFilePath, (error) => {
      if (error && error.code !== "ENOENT") {
        console.warn(`Unable to remove temporary file ${localFilePath}:`, error.message);
      }
      resolve();
    });
  });

/**
 * Upload a local image to Cloudinary and return its CDN details.
 * The local temporary file is always removed in the finally block.
 *
 * @param {string} localFilePath - Path created by Multer
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<{url: string, publicId: string, width?: number, height?: number}>}
 */
const uploadImageFromLocalFile = async (localFilePath, options = {}) => {
  if (!localFilePath) {
    throw new Error("A local file path is required for upload");
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
      folder: process.env.CLOUDINARY_FOLDER || "roomreserve",
      ...options,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } finally {
    await removeLocalFile(localFilePath);
  }
};

/**
 * Delete a previously uploaded Cloudinary asset by public ID.
 */
const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId, { invalidate: true });
};

module.exports = {
  uploadImageFromLocalFile,
  deleteImageFromCloudinary,
};
