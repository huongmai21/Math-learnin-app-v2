const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề là bắt buộc"],
      trim: true,
      maxlength: [200, "Tiêu đề không được dài quá 200 ký tự"],
    },
    content: {
      type: String,
      required: [true, "Nội dung là bắt buộc"],
    },
    image: { type: String, default: "" },
    summary: {
      type: String,
      maxlength: [500, "Tóm tắt không được dài quá 500 ký tự"],
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Tác giả là bắt buộc"],
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
      maxlength: 10,
    },
    category: {
      type: String,
      required: [true, "Danh mục là bắt buộc"],
      enum: ["education", "math-magazine"],
    },
    pdfUrl: {
      type: String,
      required: [
        function () {
          return this.category === "math-magazine";
        },
        "PDF là bắt buộc đối với Tạp chí Toán",
      ],
      default: "",
    },
    issueNumber: {
      type: Number,
      required: [
        function () {
          return this.category === "math-magazine";
        },
        "Số kỳ là bắt buộc đối với Tạp chí Toán",
      ],
    },
    year: {
      type: Number,
      required: [
        function () {
          return this.category === "math-magazine";
        },
        "Năm xuất bản là bắt buộc đối với Tạp chí Toán",
      ],
    },
  },
  { timestamps: true }
);

ArticleSchema.index({ category: 1, publishedAt: -1 });
ArticleSchema.index({ title: "text" });

module.exports = mongoose.model("Article", ArticleSchema);