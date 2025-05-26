const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");

const notificationSchema = new mongoose.Schema({
  recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: [
      "comment",
      "like",
      "mention",
      "new_post",
      "new_exam",
      "room_invite",
      "grade",
      "announcement",
      "system",
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Tiêu đề không được vượt quá 100 ký tự"],
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, "Thông báo không được vượt quá 500 ký tự"],
  },
  link: {
    type: String,
    validate: {
      validator: (v) => {
        if (!v) return true;
        return validator.isURL(v, { require_protocol: false }) || v.startsWith("/");
      },
      message: "Link phải là URL hợp lệ hoặc đường dẫn tương đối",
    },
  },
  relatedModel: {
    type: String,
    enum: ["Post", "Comment", "Exam", "StudyRoom", "ExamResult", "Course"],
  },
  relatedId: { type: Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }, // Thêm soft delete
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  importance: {
    type: String,
    enum: ["low", "normal", "high"],
    default: "normal",
  },
});

// Validation cho sender
notificationSchema.pre("save", function (next) {
  if (this.type !== "system" && !this.sender) {
    return next(new Error("Sender is required for non-system notifications"));
  }
  next();
});

// Index
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ sender: 1 }); // Thêm index cho sender
notificationSchema.index({ relatedModel: 1, relatedId: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Query chỉ lấy các thông báo chưa bị xóa
notificationSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;