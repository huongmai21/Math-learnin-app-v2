const mongoose = require("mongoose");
const validator = require("validator");

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Vui lòng nhập tiêu đề nội dung"],
    trim: true,
  },
  type: {
    type: String,
    enum: ["video", "document", "quiz"],
    required: [true, "Vui lòng chọn loại nội dung"],
  },
  url: { type: String, required: [true, "Vui lòng nhập URL nội dung"] },
  isPreview: { type: Boolean, default: false },
  platform: {
    type: String,
    enum: ["cloudinary", "youtube"],
    default: "cloudinary",
  },
  createdAt: { type: Date, default: Date.now },
});

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Vui lòng nhập tiêu đề khóa học"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Vui lòng nhập mô tả khóa học"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Vui lòng nhập giá khóa học"],
    min: [0, "Giá không thể âm"],
  },
  thumbnail: {
    type: String,
    default:
      "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png",
    validate: {
      validator: (v) => {
        if (!v) return true;
        return /^(https?:\/\/|\/)/.test(v);
      },
      message: "Thumbnail must be a valid URL or relative path",
    },
  },
  category: {
    type: String,
    enum: ["grade1", "grade2", "grade3", "university"],
    required: [true, "Vui lòng chọn danh mục khóa học"],
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  // isPublished: { type: Boolean, default: true },
  contents: [ContentSchema],
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
});

ContentSchema.path("url").validate({
  validator: function (v) {
    return /^(https?:\/\/|\/)/.test(v);
  },
  message: "URL nội dung không hợp lệ",
});

CourseSchema.pre("save", function (next) {
  this.lastUpdated = Date.now();
  next();
});

// Index để tối ưu truy vấn
CourseSchema.index({ instructorId: 1 });
CourseSchema.index({ category: 1 });
CourseSchema.index({ status: 1 });

const Course = mongoose.model("Course", CourseSchema);

module.exports = Course;
