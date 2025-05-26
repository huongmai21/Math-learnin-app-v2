const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referenceType: {
      type: String,
      enum: ["post", "document", "news", "course"],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "referenceType",
    },
    isActive: { type: Boolean, default: true }, // Thêm để hỗ trợ soft delete
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    indexes: [
      { key: { user: 1, referenceType: 1, referenceId: 1 }, unique: true },
      { key: { createdAt: -1 } }, 
    ],
  }
);

// Validate referenceId trước khi lưu
bookmarkSchema.pre("save", async function (next) {
  try {
    const modelMap = {
      post: "Post",
      document: "Document",
      news: "News",
      course: "Course",
    };
    const Model = mongoose.model(modelMap[this.referenceType]);
    const resource = await Model.findById(this.referenceId);
    if (!resource) {
      return next(new Error(`Tài nguyên ${this.referenceType} không tồn tại`));
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Query chỉ lấy bookmark còn active
bookmarkSchema.pre(/^find/, function (next) {
  this.where({ isActive: true });
  next();
});

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

module.exports = Bookmark;