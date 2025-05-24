const mongoose = require("mongoose")

const DocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Vui lòng nhập tiêu đề tài liệu"],
      trim: true,
      maxlength: [200, "Tiêu đề không được vượt quá 200 ký tự"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Mô tả không được vượt quá 1000 ký tự"],
    },
    content: {
      type: String, // HTML content with MathJax support
    },
    fileUrl: {
      type: String,
      required: [true, "Vui lòng cung cấp URL tệp tài liệu"],
      match: [/^https?:\/\/.+$/, "URL tệp không hợp lệ"],
    },
    thumbnail: {
      type: String,
      match: [/^https?:\/\/.+$/, "URL hình thu nhỏ không hợp lệ"],
    },
    educationLevel: {
      type: String,
      enum: ["primary", "secondary", "highschool", "university"],
      required: [true, "Vui lòng chọn cấp học"],
    },
    grade: {
      type: String,
      enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    },
    subject: {
      type: String,
      enum: ["advanced_math", "calculus", "algebra", "probability_statistics", "differential_equations"],
    },
    documentType: {
      type: String,
      enum: ["textbook", "exercise_book", "special_topic", "reference", "exercise"],
      required: [true, "Vui lòng chọn loại tài liệu"],
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for faster queries
DocumentSchema.index({ educationLevel: 1, grade: 1, subject: 1 })
DocumentSchema.index({ tags: 1 })
DocumentSchema.index({ uploadedAt: -1 })
DocumentSchema.index({ views: -1 })
DocumentSchema.index({ downloads: -1 })

const Document = mongoose.model("Document", DocumentSchema)

module.exports = Document
