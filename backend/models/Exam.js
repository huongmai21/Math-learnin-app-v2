const mongoose = require("mongoose");


// const questionSchema = new mongoose.Schema({
//   questionText: { type: String, required: true },
//   options: [{ type: String }],
//   correctAnswer: { type: Number, default: 0 }, // Chỉ số của đáp án đúng
//   type: {
//     type: String,
//     enum: ["multiple-choice", "text"],
//     default: "multiple-choice",
//   },
//   score: { type: Number, required: true, default: 1 }, // Thêm điểm số
//   submission: { type: String },
// });

// const submissionSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   answers: {
//     type: Map,
//     of: {
//       answer: { type: String }, // Text answer or file URL
//       score: { type: Number, default: 0 }, // Score for essay questions
//     },
//   },
//   totalScore: { type: Number, default: 0 },
//   submittedAt: { type: Date, default: Date.now },
//   isPublic: { type: Boolean, default: true },
// });

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: false,
  },
  educationLevel: {
    type: String,
    enum: ["primary", "secondary", "highschool", "university"],
    default: "primary",
  },
  subject: { type: String, required: false }, 
  duration: { type: Number, required: true }, // Đơn vị: phút
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "ExamQuestion" }],
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "ExamResult" }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy",
  },
  maxAttempts: { type: Number, default: 1 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isPublic: { type: Boolean, default: true },
  totalScore: { type: Number, default: 0 },
});

examSchema.index({ courseId: 1 });
examSchema.index({ author: 1 });
examSchema.index({ subject: 1 });

const Exam  = mongoose.model("Exam", examSchema);

module.exports = Exam;