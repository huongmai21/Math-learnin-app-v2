const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new mongoose.Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  attachments: [
    {
      type: String,
      validate: {
        validator: (v) => /^(https?:\/\/|\/)/.test(v),
        message: "Attachment must be a valid URL or relative path",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const studyRoomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  admins: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  mutedUsers: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      until: { type: Date },
    },
  ],
  isPrivate: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
  },
  subject: {
    type: String,
    enum: ["math_primary", "math_secondary", "math_highschool", "math_university", "other"],
    default: "math_highschool",
  },
  topic: {
    type: String,
  },
  messages: {
    type: [messageSchema],
    default: [],
    validate: {
      validator: (v) => v.length <= 1000,
      message: "Messages cannot exceed 1000 entries",
    },
  },
  sharedDocuments: [
    {
      url: {
        type: String,
        validate: {
          validator: (v) => /^(https?:\/\/|\/)/.test(v),
          message: "Document URL must be valid",
        },
      },
      title: { type: String, required: true },
      uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  maxMembers: {
    type: Number,
    default: 20,
  },
  status: {
    type: String,
    enum: ["active", "closed", "archived"],
    default: "active",
  },
});

// Tự động thêm creator vào admins
studyRoomSchema.pre("save", function (next) {
  if (!this.admins.includes(this.creator)) {
    this.admins.push(this.creator);
  }
  next();
});

// Index để tối ưu truy vấn
studyRoomSchema.index({ creator: 1, lastActive: -1 });
studyRoomSchema.index({ members: 1 });

const StudyRoom = mongoose.model("StudyRoom", studyRoomSchema);

module.exports = StudyRoom;