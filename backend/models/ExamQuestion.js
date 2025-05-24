const mongoose = require("mongoose");
const { Schema } = mongoose;

const examQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ["multiple-choice", "true-false", "fill-in", "essay", "math-equation"],
  },
  options: [
    {
      text: String,
      isCorrect: Boolean,
    },
  ],
  correctAnswer: { type: Schema.Types.Mixed },
  explanation: { type: String },
  hint: { type: String }, // Thêm trường gợi ý
  points: { type: Number, default: 1 },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
  },
  tags: [{ type: String }],
  images: [{ type: String }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
});

const ExamQuestion = mongoose.model("ExamQuestion", examQuestionSchema);

module.exports = ExamQuestion;