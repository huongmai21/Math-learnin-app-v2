# Backend
**1. Khởi tạo sự án Node.js:**
    - Cài đặt: 
        npm init -y
    - Cài đặt dependencies:
        npm install express mongoose dotenv cors bcryptjs jsonwebtoken
        npm install --save-dev nodemon

**2. Cấu trúc thư mục**
backend/
├── config/
│   ├── db.js
│   └── env.js
├── controllers/
│   ├── authController.js
│   └── lessonController.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── User.js
│   └── Lesson.js
├── routes/
│   ├── authRoutes.js
│   └── lessonRoutes.js
├── utils/
│   ├── errorHandler.js
│   └── jwtUtils.js
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md

**3.Danh sách package và mục đích**

- react, react-dom: Core React libraries (tự động cài với Vite).
- react-router-dom: Điều hướng (đã sử dụng trong Navbar.jsx, Home.jsx).
- react-toastify: Hiển thị thông báo (đã sử dụng trong Home.jsx, Navbar.jsx).
- socket.io-client: Kết nối Socket.io với backend (đã sử dụng trong Home.jsx).
- react-helmet: Quản lý SEO meta tags (đã sử dụng trong Home.jsx).
- framer-motion: Hiệu ứng animation (đã sử dụng trong Home.jsx, Footer.jsx).
-- redux, react-redux, @reduxjs/toolkit: Quản lý state (đã sử dụng trong Navbar.jsx).
- tailwindcss, postcss, autoprefixer: Tailwind CSS và các công cụ liên quan.
- Sử dụng nodemailer với dịch vụ email (ví dụ: Gmail).
- Thêm rate-limiting để chống brute force:giới hạn số lần gọi API, đặc biệt cho /login, /register, /forgot-password.
    npm install express-rate-limit: 
- Tích hợp CAPTCHA cho /login và /forgot-password: npm install react-google-recaptcha, react-google-recaptcha
- Tối ưu hóa SEO cho trang reset password bằng react-helmet: npm install react-helmet
- slugify :Thêm slug (tạo từ title) để URL thân thiện hơn (ví dụ: /news/ten-bai-viet)
- Redis: Trên Windows, Redis không được hỗ trợ chính thức. Cần cài đặt Redis thông qua WSL (Windows Subsystem for Linux) hoặc dùng Redis container (Docker)

- turndown
- mammoth