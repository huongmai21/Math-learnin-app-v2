import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Hàm upload file lên Cloudinary
export const uploadToCloudinary = async (file, folder = "Home") => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", folder);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(error.response?.data?.message || "Không thể upload tài liệu");
  }
};

// Interceptor cho request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const skipErrorToast = [
      "/auth/me",
      "/exams/recommended",
      "/ai/math-question",
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

    if (error.response && error.response.status === 401) {
      if (!requestUrl.includes("/auth/me")) {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;