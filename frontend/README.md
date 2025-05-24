# Frontend

**1.Tạo dự án Vite:**
- Cài đặt: 
    npm create vite@latest
    npm install
- Cài đặt Tailwind CSS:
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
- Cài đặt các thư viện bổ sung:
    npm install axios react-router-dom

**2. Cấu trúc thư mục**
frontend/
├── public/
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   │   ├── 
│   │   │   └── 
│   │   ├── layout/
│   │   │   └── Navbar
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Login.js
│   │   └── Register.js
│   ├── services/
│   │   ├── api.js
│   │   └── authService.js
│   ├── styles/
│   │   ├── index.css
│   ├── App.js
│   ├── index.js
│   └── routes.js
├── .env
├── .gitignore
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md

**3. Danh sách package và mục đích**
- npm install cloudinary 
-  "framer-motion"
    "react"
    "react-dom"
    "react-helmet"
    "react-redux"
    "react-router-dom"
    "react-toastify"
    "redux"
    "socket.io-client"

- date-fns (dùng để format datetime trong Profile.jsx)
- react-chartjs-2 chart.js vẽ biểu đồ
- Thêm Redux Persist để giữ state khi tải lại.: npm install redux-persist
- npm install mathjax-react react-quill --legacy-peer-deps
    + --legacy-peer-deps: để bỏ qua kiểm tra xung đột phiên bản
- lodash