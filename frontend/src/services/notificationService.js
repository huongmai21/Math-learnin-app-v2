import api from "./api";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
  autoConnect: false,
});

const retryRequest = async (request, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await request();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Khởi tạo kết nối Socket.IO
export const initSocket = (token) => {
  socket.auth = { token };
  socket.connect();
  socket.on("connect_error", (err) => {
    console.error("Socket.IO connection error:", err);
  });
  return socket;
};

// Lấy tất cả thông báo của người dùng
export const getNotifications = async (
  page = 1,
  limit = 10,
  unread = false
) => {
  try {
    const response = await retryRequest(() =>
      api.get(`/notifications?page=${page}&limit=${limit}&unread=${unread}`)
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// Lấy số lượng thông báo chưa đọc
export const getUnreadCount = async () => {
  try {
    const response = await retryRequest(() => api.get("/notifications/unread"));
    return response.data.count;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await retryRequest(() =>
      api.put(`/notifications/${notificationId}`)
    );
    socket.emit("ackNotifications");
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await retryRequest(() =>
      api.put("/notifications/read-all")
    );
    socket.emit("ackNotifications");
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Xóa thông báo
export const deleteNotification = async (notificationId) => {
  try {
    const response = await retryRequest(() =>
      api.delete(`/notifications/${notificationId}`)
    );
    socket.emit("ackNotifications");
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

// Tạo thông báo mới (chủ yếu dùng cho admin)
export const createNotification = async (notificationData) => {
  try {
    const response = await retryRequest(() =>
      api.post("/notifications", notificationData)
    );
    return response.data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Lắng nghe thông báo thời gian thực
export const listenForNotifications = (userId, callback) => {
  socket.on("newNotifications", (notification) => {
    callback(notification);
  });
  socket.on("global_notification", (notification) => {
    callback(notification);
  });
  socket.on("ackNotifications", () => {
    callback({ type: "ack" }); // Thông báo cập nhật từ các tab khác
  });
};

export default {
  initSocket,
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  listenForNotifications,
};