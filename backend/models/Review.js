const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: [true, "Vui lòng chọn số sao"],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, "Bình luận không được vượt quá 500 ký tự"],
  },
  // isApproved: {
  //   type: Boolean,
  //   default: false,
  // },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ReviewSchema.index({ createdAt: -1 });

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
