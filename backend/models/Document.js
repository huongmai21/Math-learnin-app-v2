const mongoose = require("mongoose");

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
    public_id: {
      type: String,
      required: [true, "Vui lòng cung cấp public_id từ Cloudinary"],
    },
    format: {
      type: String,
      enum: ["pdf", "doc", "docx"],
      required: [true, "Vui lòng chỉ định định dạng file"],
      
    },
    thumbnail: {
      type: String,
      match: [/^https?:\/\/.+$/, "URL hình thu nhỏ không hợp lệ"],
      default: "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934624/1_bsngjz.png",
    },
    educationLevel: {
      type: String,
      enum: ["primary", "secondary", "highschool", "university"],
      required: [true, "Vui lòng chọn cấp học"],
    },
    grade: {
      type: String,
      enum: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        null,
      ],
      default: null,
    },
    subject: {
      type: String,
      enum: [
        null,
        "advanced_math",
        "calculus",
        "algebra",
        "probability_statistics",
        "differential_equations",
      ],
      default: null,
    },
    documentType: {
      type: String,
      enum: [
        "textbook",
        "exercise_book",
        "special_topic",
        "reference",
        "exercise",
      ],
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
  },
  {
    timestamps: true,
  }
);

// Validation middleware
DocumentSchema.pre("validate", function (next) {
  // Chỉ cho phép grade nếu educationLevel không phải university
  if (this.educationLevel === "university" && this.grade !== null) {
    this.invalidate("grade", "Trường grade phải để trống cho cấp Đại học!");
  }
  // Chỉ cho phép subject nếu educationLevel là university
  if (this.educationLevel !== "university" && this.subject !== null) {
    this.invalidate(
      "subject",
      "Trường subject phải để trống cho các cấp Tiểu học, THCS, THPT!"
    );
  }
  // Yêu cầu subject cho university
  if (this.educationLevel === "university" && !this.subject) {
    this.invalidate("subject", "Vui lòng chọn môn học cho cấp Đại học!");
  }
  next();
});

// Indexes for faster queries
DocumentSchema.index({ educationLevel: 1, grade: 1, subject: 1 });
DocumentSchema.index({ tags: 1 });
DocumentSchema.index({ uploadedAt: -1 });
DocumentSchema.index({ views: -1 });
DocumentSchema.index({ downloads: -1 });
DocumentSchema.index({ title: "text", description: "text" }); // For search

module.exports = mongoose.model("Document", DocumentSchema);