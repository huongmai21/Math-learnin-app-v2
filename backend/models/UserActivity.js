const mongoose = require("mongoose");
const { Schema } = mongoose;

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["post", "comment", "follow", "exam", "document", "course"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  count: {
    type: Number,
    default: 1, // Số lượng hoạt động trong ngày
  },
});

const UserActivity = mongoose.model("UserActivity", userActivitySchema);

module.exports = UserActivity;
