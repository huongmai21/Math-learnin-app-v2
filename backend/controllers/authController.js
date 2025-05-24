const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");
const { sendEmail } = require("../utils/sendEmail");
const { body, validationResult } = require("express-validator");

exports.register = [
  body("username").notEmpty().withMessage("Tên người dùng không được để trống"),
  body("email")
    .isEmail()
    .withMessage("Email không hợp lệ, vui lòng nhập email đúng định dạng"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Mật khẩu phải có ít nhất 8 ký tự")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .withMessage(
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@, $, !, %, *, ?, &)"
    ),
  body("role")
    .isIn(["student", "teacher", "admin"])
    .withMessage(
      "Vai trò không hợp lệ, phải là 'student', 'teacher' hoặc 'admin'"
    ),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = {};
      errors.array().forEach((err) => {
        // Chỉ gán lỗi nếu field chưa có (tránh bị ghi đè)
        if (!formattedErrors[err.param]) {
          formattedErrors[err.param] = err.msg;
        }
      });
      return res.status(400).json({ success: false, errors: formattedErrors });
    }

    const { username, email, password, role } = req.body;
    const validRoles = ["student", "teacher", "admin"];
    if (!validRoles.includes(role)) {
      return res
        .status(400)
        .json({ success: false, errors: { role: "Vai trò không hợp lệ" } });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ success: false, errors: { email: "Email đã được sử dụng" } });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res
        .status(400)
        .json({
          success: false,
          errors: { username: "Tên người dùng đã được sử dụng" },
        });
    }

    let avatarUrl =
      "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png";
    if (req.files && req.files.avatar) {
      try {
        const result = await cloudinary.uploader.upload(
          req.files.avatar[0].path,
          {
            folder: "avatar",
            transformation: [
              {
                width: 100,
                height: 100,
                crop: "fill",
                quality: "auto",
                fetch_format: "auto",
              },
            ],
          }
        );
        avatarUrl = result.secure_url;
      } catch (error) {
        return next(new ErrorResponse("Upload ảnh thất bại", 500));
      }
    }

    const user = await User.create({
      username,
      email,
      password,
      role,
      avatar: avatarUrl,
    });

    const token = user.getSignedJwtToken();
    res.status(201).json({ success: true, token });
  }),
];

exports.login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return res.status(400).json({ success: false, errors: errorMessages });
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ErrorResponse("Không nhận được dữ liệu đăng nhập", 400));
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Email hoặc mật khẩu không đúng", 401));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Email hoặc mật khẩu không đúng", 401));
  }

  const token = user.getSignedJwtToken();
  console.log("Generated token:", token); // Debug
  res.status(200).json({ success: true, token });
});

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  console.log("User fetched in getMe:", user); // Debugy
  res.status(200).json({ success: true, data: user });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse("Không tìm thấy user với email này", 404));
  }

  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
  const mailOptions = {
    to: user.email,
    subject: "Yêu cầu đặt lại mật khẩu",
    text: `Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng truy cập link sau để đặt lại mật khẩu: ${resetUrl}. Link này có hiệu lực trong 1 giờ.`,
  };

  try {
    await sendEmail(mailOptions);
    res
      .status(200)
      .json({ success: true, message: "Email đặt lại mật khẩu đã được gửi" });
  } catch (error) {
    return next(
      new ErrorResponse("Không thể gửi email, vui lòng thử lại", 500)
    );
  }
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new ErrorResponse("Token không hợp lệ hoặc đã hết hạn", 400));
  }

  const user = await User.findById(decoded.id).select("+password");
  if (!user) {
    return next(new ErrorResponse("Không tìm thấy user", 404));
  }

  user.password = password;
  await user.save();

  if (global.io) {
    global.io.to(user._id.toString()).emit("passwordResetSuccess", {
      message: "Đặt lại mật khẩu thành công!",
    });
  }

  res
    .status(200)
    .json({ success: true, message: "Đặt lại mật khẩu thành công" });
});
