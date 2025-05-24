// adminService.js
import api from "./api"

// Cache đơn giản sử dụng Map
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// Helper để kiểm tra và lấy cache
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Helper để lưu cache
const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const getUsers = async () => {
  const cacheKey = "users";
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await api.get(`/users`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  setCachedData(cacheKey, response);
  return response;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  cache.delete("users"); // Xóa cache khi có thay đổi
  return response;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.put(
    `/users/${userId}/role`,
    { role },
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
  cache.delete("users");
  return response;
};

export const getCourses = async () => {
  const cacheKey = "courses";
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await api.get(`/courses`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  setCachedData(cacheKey, response);
  return response;
};

export const approveCourse = async (courseId) => {
  const response = await api.put(
    `/courses/${courseId}/approve`,
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
  cache.delete("courses");
  return response;
};

export const rejectCourse = async (courseId) => {
  const response = await api.put(
    `/courses/${courseId}/reject`,
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
  cache.delete("courses");
  return response;
};

export const deleteCourse = async (courseId) => {
  const response = await api.delete(`/courses/${courseId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  cache.delete("courses");
  return response;
};

export const getExams = async () => {
  const cacheKey = "exams";
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await api.get(`/exams`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  setCachedData(cacheKey, response);
  return response;
};

export const approveExam = async (examId) => {
  const response = await api.put(
    `/exams/${examId}/approve`,
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
  cache.delete("exams");
  return response;
};

export const rejectExam = async (examId) => {
  const response = await api.put(
    `/exams/${examId}/reject`,
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
  cache.delete("exams");
  return response;
};

export const deleteExam = async (examId) => {
  const response = await api.delete(`/exams/${examId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  cache.delete("exams");
  return response;
};

export const getNews = async () => {
  const cacheKey = "news";
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await api.get(`/news`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  setCachedData(cacheKey, response);
  return response;
};

export const createNews = async (formData) => {
  const response = await api.post(`/news`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
  cache.delete("news");
  return response;
};

export const updateNews = async (newsId, formData) => {
  const response = await api.put(`/news/${newsId}`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
  cache.delete("news");
  return response;
};

export const approveNews = async (newsId) => {
  const response = await api.put(
    `/news/${newsId}/approve`,
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
  cache.delete("news");
  return response;
};

export const rejectNews = async (newsId) => {
  const response = await api.put(
    `/news/${newsId}/reject`,
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
  cache.delete("news");
  return response;
};

export const deleteNews = async (newsId) => {
  const response = await api.delete(`/news/${newsId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  cache.delete("news");
  return response;
};

export const getDocuments = async () => {
  const cacheKey = "documents";
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await api.get(`/documents`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  setCachedData(cacheKey, response);
  return response;
};

export const approveDocument = async (documentId) => {
  const response = await api.put(
    `/documents/${documentId}/approve`,
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
  cache.delete("documents");
  return response;
};

export const rejectDocument = async (documentId) => {
  const response = await api.put(
    `/documents/${documentId}/reject`,
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
  cache.delete("documents");
  return response;
};

export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  cache.delete("documents");
  return response;
};

export const getBookmarks = async () => {
  const cacheKey = "bookmarks";
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await api.get(`/bookmarks`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  setCachedData(cacheKey, response);
  return response;
};

export const deleteBookmark = async (itemId) => {
  const response = await api.delete(`/bookmarks/${itemId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  cache.delete("bookmarks");
  return response;
};

export const getComments = async () => {
  const cacheKey = "comments";
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await api.get(`/comments`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  setCachedData(cacheKey, response);
  return response;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  cache.delete("comments");
  return response;
};

export const getQuestions = async () => {
  const cacheKey = "questions";
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await api.get(`/questions`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  setCachedData(cacheKey, response);
  return response;
};

export const answerQuestion = async (questionId, data) => {
  const response = await api.put(
    `/questions/${questionId}/answer`,
    data,
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
  cache.delete("questions");
  return response;
};

export const deleteQuestion = async (questionId) => {
  const response = await api.delete(`/questions/${questionId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  cache.delete("questions");
  return response;
};

export const getStats = async () => {
  const cacheKey = "stats";
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await api.get(`/stats`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  setCachedData(cacheKey, response);
  return response;
};

export const getDetailedStats = async (period) => {
  const cacheKey = `detailedStats_${period}`;
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await api.get(`/stats/detailed?period=${period}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  setCachedData(cacheKey, response);
  return response;
};

export const getNewsStats = async () => {
  const cacheKey = "newsStats";
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await api.get(`/stats/news`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  setCachedData(cacheKey, response);
  return response;
};