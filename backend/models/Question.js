// models/Question.js
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "answered"], default: "pending" },
  answer: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Question", questionSchema);