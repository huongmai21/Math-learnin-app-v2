const mongoose = require("mongoose")
const { Schema } = mongoose

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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    indexes: [{ key: { user: 1, referenceType: 1, referenceId: 1 }, unique: true }],
  },
)

const Bookmark = mongoose.model("Bookmark", bookmarkSchema)

module.exports = Bookmark
