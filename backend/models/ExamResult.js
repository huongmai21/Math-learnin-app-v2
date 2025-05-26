// models/ExamResult.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const examResultSchema = new mongoose.Schema({
  exam: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  answers: [
    {
      question: { type: Schema.Types.ObjectId, ref: "ExamQuestion" },
      userAnswer: Schema.Types.Mixed,
      isCorrect: Boolean,
      score: Number,
    },
  ],
  totalScore: { type: Number },
  startTime: { type: Date },
  endTime: { type: Date },
  completed: { type: Boolean, default: false },
  feedback: [
    {
      question: { type: Schema.Types.ObjectId, ref: "ExamQuestion" },
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  attemptNumber: { type: Number, default: 1 },
});

examResultSchema.pre("validate", async function (next) {
  for (const answer of this.answers) {
    const question = await ExamQuestion.findById(answer.question);
    if (!question) {
      return next(new Error(`Câu hỏi ${answer.question} không tồn tại`));
    }
    if (question.questionType === "multiple-choice" && typeof answer.userAnswer !== "number") {
      return next(new Error("Đáp án trắc nghiệm phải là số"));
    }
    if (question.questionType === "essay" && typeof answer.userAnswer !== "string") {
      return next(new Error("Đáp án tự luận phải là chuỗi"));
    }
  }
  next();
});

examResultSchema.index({ exam: 1, user: 1 }, { unique: true });

const ExamResult = mongoose.model("ExamResult", examResultSchema);

module.exports = ExamResult;
