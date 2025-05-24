import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "http://localhost:5000/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Không hiển thị toast cho một số lỗi cụ thể
    const skipErrorToast = [
      "/auth/me", // Bỏ qua lỗi khi kiểm tra token
      "/exams/recommended", // Bỏ qua lỗi khi lấy đề thi gợi ý
      "/ai/math-question", // Bỏ qua lỗi khi gọi AI
    ];

    const requestUrl = error.config.url;
    const shouldSkipToast = skipErrorToast.some((url) =>
      requestUrl.includes(url)
    );

    if (!shouldSkipToast) {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại sau";
      toast.error(errorMessage);
    }

    // Xử lý lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Nếu không phải là lỗi khi kiểm tra token, đăng xuất người dùng
      if (!requestUrl.includes("/api/auth/me")) {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
