// backend/utils/cloudinaryUtils.js
const cloudinary = require("../config/cloudinary");

exports.uploadToCloudinary = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};