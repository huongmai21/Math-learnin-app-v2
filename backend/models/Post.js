const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    enum: ["exercise", "question", "share"],
    default: "share",
  },
  subject: {
    type: String,
    enum: ["primary", "secondary", "highschool", "university", "other"],
    default: "other",
  },
  status: {
    type: String,
    enum: ["open", "pending", "solved"],
    default: "open",
  },
  images: {
    type: [String],
    default: [],
  },
  files: {
    type: [{ name: String, url: String, type: String }],
    default: [],
  },
  likes: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  views: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  aiResponse: {
    type: String,
    default: "",
  },
  isAiAnswered: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);