const socketIo = require("socket.io")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const setupSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  // Middleware để xác thực người dùng qua token
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token

      if (!token) {
        return next(new Error("Authentication error: Token not provided"))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select("-password")

      if (!user) {
        return next(new Error("Authentication error: User not found"))
      }

      socket.user = user
      next()
    } catch (error) {
      next(new Error("Authentication error: " + error.message))
    }
  })

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`)

    // Tham gia phòng cá nhân để nhận thông báo
    socket.join(socket.user._id.toString())

    // Tham gia phòng học
    socket.on("join_room", (roomId) => {
      socket.join(`room_${roomId}`)
      console.log(`${socket.user.username} joined room: ${roomId}`)

      // Thông báo cho các thành viên khác
      socket.to(`room_${roomId}`).emit("user_joined", {
        userId: socket.user._id,
        username: socket.user.username,
        avatar: socket.user.avatar,
      })
    })

    // Rời phòng học
    socket.on("leave_room", (roomId) => {
      socket.leave(`room_${roomId}`)
      console.log(`${socket.user.username} left room: ${roomId}`)

      // Thông báo cho các thành viên khác
      socket.to(`room_${roomId}`).emit("user_left", {
        userId: socket.user._id,
        username: socket.user.username,
      })
    })

    // Gửi tin nhắn trong phòng học
    socket.on("send_message", ({ roomId, message }) => {
      // Tin nhắn sẽ được xử lý qua API, socket chỉ dùng để thông báo real-time
      console.log(`Message in room ${roomId} from ${socket.user.username}: ${message}`)
    })

    // Thông báo đang gõ
    socket.on("typing", ({ roomId }) => {
      socket.to(`room_${roomId}`).emit("user_typing", {
        userId: socket.user._id,
        username: socket.user.username,
      })
    })

    // Ngắt kết nối
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.username}`)
    })
  })

  // Lưu trữ io để sử dụng ở nơi khác
  global.io = io

  return io
}

module.exports = setupSocket
