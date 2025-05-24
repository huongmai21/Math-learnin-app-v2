const StudyRoom = require("../models/StudyRoom")
const User = require("../models/User")
const Notification = require("../models/Notification")
const asyncHandler = require("../middleware/asyncHandler")
const ErrorResponse = require("../utils/errorResponse")

// Tạo phòng học nhóm mới
exports.createStudyRoom = asyncHandler(async (req, res, next) => {
  const { title, description, isPrivate, password, subject, topic, maxMembers } = req.body

  const room = await StudyRoom.create({
    title,
    description,
    creator: req.user.id,
    members: [req.user.id],
    isPrivate,
    password,
    subject,
    topic,
    maxMembers: maxMembers || 20,
    status: "active",
    createdAt: new Date(),
    lastActive: new Date(),
  })

  res.status(201).json({
    success: true,
    data: room,
  })
})

// Lấy danh sách phòng học nhóm (có phân trang và lọc)
exports.getStudyRooms = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, subject, status = "active", search } = req.query

  const query = { status }

  if (subject) {
    query.subject = subject
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { topic: { $regex: search, $options: "i" } },
    ]
  }

  const rooms = await StudyRoom.find(query)
    .populate("creator", "username avatar")
    .populate("members", "username avatar")
    .sort({ lastActive: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))

  const total = await StudyRoom.countDocuments(query)

  res.status(200).json({
    success: true,
    data: rooms,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  })
})

// Lấy chi tiết phòng học nhóm
exports.getStudyRoomById = asyncHandler(async (req, res, next) => {
  const room = await StudyRoom.findById(req.params.id)
    .populate("creator", "username avatar")
    .populate("members", "username avatar")
    .populate("messages.sender", "username avatar")

  if (!room) {
    return next(new ErrorResponse("Không tìm thấy phòng học nhóm", 404))
  }

  res.status(200).json({
    success: true,
    data: room,
  })
})

// Tham gia phòng học nhóm
exports.joinStudyRoom = asyncHandler(async (req, res, next) => {
  const { password } = req.body
  const room = await StudyRoom.findById(req.params.id)

  if (!room) {
    return next(new ErrorResponse("Không tìm thấy phòng học nhóm", 404))
  }

  if (room.status !== "active") {
    return next(new ErrorResponse("Phòng học nhóm đã đóng hoặc lưu trữ", 400))
  }

  if (room.members.includes(req.user.id)) {
    return next(new ErrorResponse("Bạn đã tham gia phòng học nhóm này", 400))
  }

  if (room.members.length >= room.maxMembers) {
    return next(new ErrorResponse("Phòng học nhóm đã đầy", 400))
  }

  if (room.isPrivate && room.password !== password) {
    return next(new ErrorResponse("Mật khẩu không đúng", 400))
  }

  room.members.push(req.user.id)
  room.lastActive = new Date()
  await room.save()

  // Thông báo cho người tạo phòng
  await Notification.create({
    recipient: room.creator,
    sender: req.user.id,
    type: "study_room",
    title: "Thành viên mới tham gia phòng học",
    message: `${req.user.username} đã tham gia phòng học "${room.title}"`,
    link: `/study-room/${room._id}`,
    relatedModel: "StudyRoom",
    relatedId: room._id,
  })

  res.status(200).json({
    success: true,
    data: room,
  })
})

// Rời khỏi phòng học nhóm
exports.leaveStudyRoom = asyncHandler(async (req, res, next) => {
  const room = await StudyRoom.findById(req.params.id)

  if (!room) {
    return next(new ErrorResponse("Không tìm thấy phòng học nhóm", 404))
  }

  if (!room.members.includes(req.user.id)) {
    return next(new ErrorResponse("Bạn chưa tham gia phòng học nhóm này", 400))
  }

  // Nếu là người tạo phòng và còn thành viên khác, chuyển quyền cho người khác
  if (room.creator.toString() === req.user.id && room.members.length > 1) {
    const newCreator = room.members.find((member) => member.toString() !== req.user.id)
    room.creator = newCreator
  }

  // Nếu là người tạo phòng và không còn thành viên khác, đóng phòng
  if (room.creator.toString() === req.user.id && room.members.length === 1) {
    room.status = "closed"
  }

  room.members = room.members.filter((member) => member.toString() !== req.user.id)
  room.lastActive = new Date()
  await room.save()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// Gửi tin nhắn trong phòng học nhóm
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { content, attachments } = req.body
  const room = await StudyRoom.findById(req.params.id)

  if (!room) {
    return next(new ErrorResponse("Không tìm thấy phòng học nhóm", 404))
  }

  if (!room.members.includes(req.user.id)) {
    return next(new ErrorResponse("Bạn chưa tham gia phòng học nhóm này", 400))
  }

  if (room.status !== "active") {
    return next(new ErrorResponse("Phòng học nhóm đã đóng hoặc lưu trữ", 400))
  }

  const message = {
    sender: req.user.id,
    content,
    attachments: attachments || [],
    createdAt: new Date(),
  }

  room.messages.push(message)
  room.lastActive = new Date()
  await room.save()

  // Populate sender info for the new message
  const populatedRoom = await StudyRoom.findById(req.params.id).populate("messages.sender", "username avatar")

  const newMessage = populatedRoom.messages[populatedRoom.messages.length - 1]

  // Emit socket event for real-time messaging
  if (global.io) {
    global.io.to(`room_${req.params.id}`).emit("new_message", newMessage)
  }

  res.status(201).json({
    success: true,
    data: newMessage,
  })
})

// Đóng phòng học nhóm (chỉ người tạo)
exports.closeStudyRoom = asyncHandler(async (req, res, next) => {
  const room = await StudyRoom.findById(req.params.id)

  if (!room) {
    return next(new ErrorResponse("Không tìm thấy phòng học nhóm", 404))
  }

  if (room.creator.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Bạn không có quyền đóng phòng học nhóm này", 403))
  }

  room.status = "closed"
  await room.save()

  // Thông báo cho tất cả thành viên
  const notifications = room.members
    .filter((member) => member.toString() !== req.user.id)
    .map((member) => ({
      recipient: member,
      sender: req.user.id,
      type: "study_room",
      title: "Phòng học đã đóng",
      message: `Phòng học "${room.title}" đã được đóng bởi người tạo`,
      link: `/study-room`,
      relatedModel: "StudyRoom",
      relatedId: room._id,
    }))

  if (notifications.length > 0) {
    await Notification.insertMany(notifications)
  }

  res.status(200).json({
    success: true,
    data: {},
  })
})

// Lấy danh sách phòng học nhóm của người dùng hiện tại
exports.getMyStudyRooms = asyncHandler(async (req, res, next) => {
  const { status = "active" } = req.query

  const rooms = await StudyRoom.find({
    members: req.user.id,
    status,
  })
    .populate("creator", "username avatar")
    .populate("members", "username avatar")
    .sort({ lastActive: -1 })

  res.status(200).json({
    success: true,
    data: rooms,
  })
})
