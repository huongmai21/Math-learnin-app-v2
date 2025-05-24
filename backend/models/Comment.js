const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    referenceId: { type: mongoose.Schema.ObjectId, required: true },
    referenceType: { 
      type: String, 
      required: true, 
      enum: ["article", "document", "course","post","news"] 
    },
    content: { type: String, required: true },
    author: { 
      type: mongoose.Schema.ObjectId, 
      ref: "User", 
      required: true 
    },
    parentComment: { 
      type: mongoose.Schema.ObjectId, 
      ref: "Comment", 
      default: null 
    },
    replies: [{ type: mongoose.Schema.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

// Populate replies recursively
CommentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "author",
    select: "username fullName avatar",
  }).populate({
    path: "replies",
    populate: { path: "author", select: "username fullName avatar" },
  });
  next();
});

CommentSchema.index({ referenceId: 1, referenceType: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", CommentSchema);