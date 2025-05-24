const mongoose = require("mongoose")
const { Schema } = mongoose

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  educationLevel: { type: String, required: true },
  subject: { type: String, required: true },
  duration: { type: Number, required: true },
  questions: [{ type: Schema.Types.Mixed }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  maxAttempts: { type: Number, default: 1 }, // Giới hạn số lần làm bài
  attempts: { type: Number, default: 0 } // Thêm trường attempts để theo dõi số lượt tham gia
})

// Validation để đảm bảo endTime > startTime
examSchema.pre("save", function (next) {
  if (this.endTime <= this.startTime) {
    return next(new Error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu"))
  }
  next()
})

const Exam = mongoose.model("Exam", examSchema)

module.exports = Exam