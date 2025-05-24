const mongoose = require("mongoose")
const { Schema } = mongoose

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: false,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: false,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

const Score = mongoose.model("Score", scoreSchema)

module.exports = Score
