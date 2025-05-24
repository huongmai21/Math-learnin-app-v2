const { cloudinary, uploadToCloudinary } = require("../config/cloudinary");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

exports.uploadFile = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.file) {
    return next(new ErrorResponse("Không có file được tải lên!", 400));
  }

  const file = req.files.file;
  const folder = req.body.folder || process.env.DEFAULT_UPLOAD_FOLDER || "Home";

  try {
    const result = await uploadToCloudinary(file.data, folder);
    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    return next(new ErrorResponse(`Lỗi upload file: ${error.message}`, 500));
  }
});

exports.uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.image) {
    return next(new ErrorResponse("Không có ảnh được tải lên!", 400));
  }

  const file = req.files.image;
  try {
    const result = await uploadToCloudinary(file.data, "Home");
    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    return next(new ErrorResponse(`Lỗi upload ảnh: ${error.message}`, 500));
  }
});