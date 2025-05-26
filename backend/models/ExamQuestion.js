const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");

const examQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: [
      "multiple-choice",
      "true-false",
      "fill-in",
      "essay",
      "math-equation",
    ],
  },
  options: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, default: false },
    },
  ],
  correctAnswer: {
    type: Schema.Types.Mixed,
    validate: {
      validator: function (v) {
        if (
          this.questionType === "multiple-choice" ||
          this.questionType === "true-false"
        ) {
          return typeof v === "number" || typeof v === "boolean";
        }
        if (this.questionType === "fill-in" || this.questionType === "essay") {
          return typeof v === "string";
        }
        if (this.questionType === "math-equation") {
          return v && typeof v === "object"; // Ví dụ: { latex: String, value: String }
        }
        return false;
      },
      message: "Đáp án đúng không hợp lệ cho loại câu hỏi",
    },
  },
  explanation: { type: String },
  hint: { type: String }, // Thêm trường gợi ý
  score: { type: Number, default: 1 },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
  },
  tags: [{ type: String }],
  images: [{ type: String }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  lastUpdated: { type: Date, default: Date.now },
});

// Validator cho câu hỏi multiple-choice
examQuestionSchema.pre("validate", function (next) {
  if (this.questionType === "multiple-choice") {
    if (this.options.length < 2) {
      return next(new Error("Câu hỏi trắc nghiệm cần ít nhất 2 lựa chọn"));
    }
    // const correctOptions = this.options.filter((opt) => opt.isCorrect);
    // if (correctOptions.length !== 1) {
    //   return next(new Error("Câu hỏi trắc nghiệm cần đúng 1 đáp án đúng"));
    // }
  }
  next();
});

examQuestionSchema.pre("save", function (next) {
  this.lastUpdated = Date.now();
  next();
});

examQuestionSchema.index({ tags: 1 });
examQuestionSchema.index({ difficulty: 1 });
examQuestionSchema.index({ createdBy: 1 });

const ExamQuestion = mongoose.model("ExamQuestion", examQuestionSchema);

module.exports = ExamQuestion;
