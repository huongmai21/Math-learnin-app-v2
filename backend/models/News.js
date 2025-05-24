// backend/models/News.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const slugify = require("slugify");

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String },
  category: {
    type: String,
    enum: ["education", "math-magazine", "science", "competitions"],
    required: true,
  },
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  image: { type: String },
  file: { type: String },
  // issueNumber: { type: String },
  publishedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
});

// Tạo chỉ mục để tối ưu tìm kiếm
newsSchema.index({
  title: "text",
  content: "text",
  summary: "text",
  tags: "text",
});

newsSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

const News = mongoose.model("News", newsSchema);

module.exports = News;
