const multer = require("multer");

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(file.originalname.toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Chỉ hỗ trợ file JPEG, JPG, PNG!"));
};

const upload = multer({
  storage: multer.memoryStorage(), // Lưu file vào bộ nhớ, không lưu đĩa
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

module.exports = upload;