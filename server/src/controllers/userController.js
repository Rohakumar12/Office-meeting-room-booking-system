const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const {
  uploadImageFromLocalFile,
  deleteImageFromCloudinary,
} = require("../utils/cloudinary");

/**
 * POST /api/users/profile-image
 * Multer has already saved the uploaded file to public/uploads.
 * Upload it to Cloudinary, persist the CDN URL, then remove the old asset.
 */
const uploadProfileImage = async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, "Profile image file is required"));
  }

  try {
    const upload = await uploadImageFromLocalFile(req.file.path, {
      folder: `${process.env.CLOUDINARY_FOLDER || "roomreserve"}/profile-images`,
      transformation: [
        { width: 512, height: 512, crop: "fill", gravity: "face" },
        { quality: "auto" },
      ],
    });

    const user = await User.findById(req.user._id);
    if (!user) {
      await deleteImageFromCloudinary(upload.publicId);
      throw new ApiError(404, "User not found");
    }

    const previousPublicId = user.avatarPublicId;
    user.avatar = upload.url;
    user.avatarPublicId = upload.publicId;

    try {
      await user.save();
    } catch (error) {
      // Do not leave an orphaned Cloudinary asset if MongoDB update fails.
      await deleteImageFromCloudinary(upload.publicId).catch(() => {});
      throw error;
    }

    if (previousPublicId && previousPublicId !== upload.publicId) {
      await deleteImageFromCloudinary(previousPublicId).catch((error) => {
        console.warn("Unable to remove previous profile image:", error.message);
      });
    }

    return res.status(200).json(
      new ApiResponse(200, { user }, "Profile image uploaded successfully"),
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = { uploadProfileImage };
