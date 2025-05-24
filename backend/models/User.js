const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ProgressSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  completedContents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course.contents",
    },
  ],
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Vui lòng nhập tên người dùng"],
    unique: true,
    trim: true,
    minlength: [3, "Tên người dùng phải có ít nhất 3 ký tự"],
    match: [
      /^[a-zA-Z0-9_]+$/,
      "Tên người dùng chỉ được chứa chữ, số và dấu gạch dưới",
    ],
  },
  email: {
    type: String,
    required: [true, "Vui lòng nhập email"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Vui lòng nhập email hợp lệ"],
  },
  password: {
    type: String,
    required: [true, "Vui lòng nhập mật khẩu"],
    minlength: [8, "Mật khẩu phải có ít nhất 10 ký tự"],
    minlength: [8, "Mật khẩu phải có ít nhất 10 ký tự"],
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
    ],
    select: false,
  },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },
  avatar: {
    type: String,
    default:
      "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png",
    validate: {
      validator: (v) => {
        if (!v) return true;
        return /^(https?:\/\/|\/)/.test(v);
      },
      message: "Avatar must be a valid URL or relative path",
    },
  },
  bio: {
    type: String,
    trim: true,
  },
  badges: [
    {
      type: { type: String, enum: ["gold", "silver", "bronze"] },
      awardedAt: { type: Date, default: Date.now },
    },
  ],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  completedCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  progress: [ProgressSchema],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password trước khi lưu
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Tạo JWT token
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Kiểm tra mật khẩu
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Index để tối ưu truy vấn
UserSchema.index({ role: 1 });

const User = mongoose.model("User", UserSchema);

module.exports = User;
