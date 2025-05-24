const mongoose = require("mongoose");
const { Schema } = mongoose;

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
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: {
    type: String,
    validate: {
      validator: (v) => {
        if (!v) return true;
        return /^(https?:\/\/|\/)/.test(v);
      },
      message: "Link must be a valid URL or relative path",
    },
  },
  relatedModel: {
    type: String,
    enum: ["Post", "Comment", "Exam", "StudyRoom", "ExamResult", "Course"],
  },
  relatedId: { type: Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
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

// Index để tăng tốc độ truy vấn
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ relatedModel: 1, relatedId: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
