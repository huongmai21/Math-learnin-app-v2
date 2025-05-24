// models/ExamResult.js
const mongoose = require("mongoose")
const { Schema } = mongoose

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
  feedback: { type: String },
})

const ExamResult = mongoose.model("ExamResult", examResultSchema)

module.exports = ExamResult
