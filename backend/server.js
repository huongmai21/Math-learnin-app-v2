const express = require("express")
const connectMongoDB = require("./config/mongo")
const path = require("path")
const cors = require("cors")
const rateLimit = require("express-rate-limit")
const morgan = require("morgan")
const { Server } = require("socket.io")
const http = require("http")
// const fileUpload = require("express-fileupload")
const errorHandler = require("./middleware/error")

require("dotenv").config({ path: path.resolve(__dirname, ".env") })
require("./utils/notificationCron");

// MongoDB Connection
connectMongoDB()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 request mỗi IP
  message: "Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau 15 phút.",
})

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Giới hạn 3 request mỗi IP
  message: "Quá nhiều yêu cầu reset mật khẩu, vui lòng thử lại sau 1 giờ.",
})

// Middleware
app.use(cors())
app.use(express.json())
// app.use(fileUpload())
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Thêm logging cho các routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`)
  next()
})

// Thêm middleware kiểm tra token
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (token) {
    console.log("Token được gửi trong request:", token.substring(0, 10) + "...")
  }
  next()
})

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const profileRoutes = require("./routes/profileRoutes");
const newsRoutes = require("./routes/newsRoutes");
const documentRoutes = require("./routes/documentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const examRoutes = require("./routes/examRoutes");
const postRoutes = require("./routes/postRoutes");
const studyRoomRoutes = require("./routes/studyRoomRoutes");
const commentRoutes = require("./routes/commentRoutes");
// const uploadRoutes = require("./routes/uploadRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const searchRoutes = require("./routes/searchRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");

// Routes
app.use("/admin",  adminRoutes);
app.use("/auth/login", loginLimiter, authRoutes);
app.use("/auth/forgot-password", forgotPasswordLimiter, authRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/users/profile", profileRoutes);
app.use("/documents", documentRoutes);
app.use("/news", newsRoutes);
app.use("/courses", courseRoutes);
app.use("/exams",  examRoutes);
app.use("/posts",  postRoutes);
app.use("/study-room",  studyRoomRoutes);
app.use("/search",  searchRoutes);
app.use("/bookmarks",  bookmarkRoutes);
app.use("/comments",  commentRoutes);
app.use("/notifications", notificationsRoutes);
// app.use("/upload",  uploadRoutes);

app.use(errorHandler)

// Cloudinary preset endpoint
app.get("/cloudinary-upload-preset", (req, res) => {
  try {
    const preset = {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    }
    res.status(200).json(preset)
  } catch (error) {
    console.error("Error fetching Cloudinary preset:", error.message)
    res.status(500).json({
      message: "Lỗi khi lấy thông tin Cloudinary",
      error: error.message,
    })
  }
})

// Socket.io
global.io = io // Lưu io vào global để dùng trong controller

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("join", (userId) => {
    if (!userId) {
      socket.emit("error", "Invalid userId");
      return;
    }
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

// Start Server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Thêm xử lý lỗi không bắt được
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err)
})
