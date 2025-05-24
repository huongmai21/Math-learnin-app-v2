// Lưu bookmark khóa học của người dùng

const mongoose = require("mongoose")

const EnrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
})

// Index để tối ưu truy vấn
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true })

const Enrollment = mongoose.model("Enrollment", EnrollmentSchema)

module.exports = Enrollment
