import api from "./api";

// Cache management using Map
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper to check and retrieve cache
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key); // Remove stale cache
  return null;
};

// Helper to store cache
const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Centralized headers with token
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Clear specific cache or all caches
export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

// Fetch users
export const getUsers = async (filters = {}) => {
  const cacheKey = `users_${JSON.stringify(filters)}`;
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await api.get(`/admin/users`, {
      headers: getAuthHeaders(),
      params: filters,
    });
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    cache.delete("users");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete user");
  }
};

// Update user role
export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(
      `/admin/users/${userId}/role`,
      { role },
      { headers: getAuthHeaders() }
    );
    cache.delete("users");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update user role"
    );
  }
};

// Fetch courses
export const getCourses = async (filters = {}) => {
  const cacheKey = `courses_${JSON.stringify(filters)}`;
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await api.get(`/admin/courses`, {
      headers: getAuthHeaders(),
      params: filters,
    });
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch courses");
  }
};

// Create course
export const createCourse = async (formData) => {
  try {
    const response = await api.post(`/admin/courses`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    cache.delete("courses");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create course");
  }
};

// Update course
export const updateCourse = async (courseId, formData) => {
  try {
    const response = await api.put(`/admin/courses/${courseId}`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    cache.delete("courses");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update course");
  }
};

// Approve course
export const approveCourse = async (courseId) => {
  try {
    const response = await api.put(
      `/admin/courses/${courseId}/approve`,
      {},
      { headers: getAuthHeaders() }
    );
    cache.delete("courses");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to approve course"
    );
  }
};

// Reject course
export const rejectCourse = async (courseId) => {
  try {
    const response = await api.put(
      `/admin/courses/${courseId}/reject`,
      {},
      { headers: getAuthHeaders() }
    );
    cache.delete("courses");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to reject course");
  }
};

// Delete course
export const deleteCourse = async (courseId) => {
  try {
    const response = await api.delete(`/admin/courses/${courseId}`, {
      headers: getAuthHeaders(),
    });
    cache.delete("courses");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete course");
  }
};

// Fetch exams
export const getExams = async (filters = {}) => {
  const cacheKey = `exams_${JSON.stringify(filters)}`;
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await api.get(`/admin/exams`, {
      headers: getAuthHeaders(),
      params: filters,
    });
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch exams");
  }
};

// Approve exam
export const approveExam = async (examId) => {
  try {
    const response = await api.put(
      `/admin/exams/${examId}/approve`,
      {},
      { headers: getAuthHeaders() }
    );
    cache.delete("exams");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to approve exam");
  }
};

// Reject exam
export const rejectExam = async (examId) => {
  try {
    const response = await api.put(
      `/admin/exams/${examId}/reject`,
      {},
      { headers: getAuthHeaders() }
    );
    cache.delete("exams");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to reject exam");
  }
};

// Delete exam
export const deleteExam = async (examId) => {
  try {
    const response = await api.delete(`/admin/exams/${examId}`, {
      headers: getAuthHeaders(),
    });
    cache.delete("exams");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete exam");
  }
};

// Fetch news
export const getNews = async (filters = {}) => {
  const cacheKey = `news_${JSON.stringify(filters)}`;
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await api.get(`/admin/news`, {
      headers: getAuthHeaders(),
      params: filters,
    });
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch news");
  }
};

// Create news
export const createNews = async (formData) => {
  try {
    const response = await api.post(`/admin/news`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    cache.delete("news");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create news");
  }
};

// Update news
export const updateNews = async (newsId, formData) => {
  try {
    const response = await api.put(`/admin/news/${newsId}`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    cache.delete("news");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update news");
  }
};

// Approve news
export const approveNews = async (newsId) => {
  try {
    const response = await api.put(
      `/admin/news/${newsId}/approve`,
      {},
      { headers: getAuthHeaders() }
    );
    cache.delete("news");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to approve news");
  }
};

// Reject news
export const rejectNews = async (newsId) => {
  try {
    const response = await api.put(
      `/admin/news/${newsId}/reject`,
      {},
      { headers: getAuthHeaders() }
    );
    cache.delete("news");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to reject news");
  }
};

// Delete news
export const deleteNews = async (newsId) => {
  try {
    const response = await api.delete(`/admin/news/${newsId}`, {
      headers: getAuthHeaders(),
    });
    cache.delete("news");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete news");
  }
};

// Fetch documents
export const getDocuments = async (filters = {}) => {
  const cacheKey = `documents_${JSON.stringify(filters)}`;
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await api.get(`/admin/documents`, {
      headers: getAuthHeaders(),
      params: filters,
    });
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch documents"
    );
  }
};

// Create document
export const createDocument = async (formData) => {
  try {
    const response = await api.post(`/admin/documents`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    cache.delete("documents");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create document"
    );
  }
};

// Update document
export const updateDocument = async (documentId, formData) => {
  try {
    const response = await api.put(`/admin/documents/${documentId}`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    cache.delete("documents");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update document"
    );
  }
};

// Approve document
export const approveDocument = async (documentId) => {
  try {
    const response = await api.put(
      `/admin/documents/${documentId}/approve`,
      {},
      { headers: getAuthHeaders() }
    );
    cache.delete("documents");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to approve document"
    );
  }
};

// Reject document
export const rejectDocument = async (documentId) => {
  try {
    const response = await api.put(
      `/admin/documents/${documentId}/reject`,
      {},
      { headers: getAuthHeaders() }
    );
    cache.delete("documents");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to reject document"
    );
  }
};

// Delete document
export const deleteDocument = async (documentId) => {
  try {
    const response = await api.delete(`/admin/documents/${documentId}`, {
      headers: getAuthHeaders(),
    });
    cache.delete("documents");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete document"
    );
  }
};

// Fetch bookmarks
export const getBookmarks = async () => {
  const cacheKey = "bookmarks";
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await api.get(`/admin/bookmarks`, {
      headers: getAuthHeaders(),
    });
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch bookmarks"
    );
  }
};

// Delete bookmark
export const deleteBookmark = async (itemId) => {
  try {
    const response = await api.delete(`/admin/bookmarks/${itemId}`, {
      headers: getAuthHeaders(),
    });
    cache.delete("bookmarks");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete bookmark"
    );
  }
};

// Fetch comments
export const getComments = async (filters = {}) => {
  const cacheKey = `comments_${JSON.stringify(filters)}`;
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await api.get(`/admin/comments`, {
      headers: getAuthHeaders(),
      params: filters,
    });
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch comments"
    );
  }
};

// Delete comment
export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/admin/comments/${commentId}`, {
      headers: getAuthHeaders(),
    });
    cache.delete("comments");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete comment"
    );
  }
};

// Fetch questions
export const getQuestions = async (filters = {}) => {
  const cacheKey = `questions_${JSON.stringify(filters)}`;
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await api.get(`/admin/questions`, {
      headers: getAuthHeaders(),
      params: filters,
    });
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch questions"
    );
  }
};

// Answer question
export const answerQuestion = async (questionId, data) => {
  try {
    const response = await api.put(
      `/admin/questions/${questionId}/answer`,
      data,
      { headers: getAuthHeaders() }
    );
    cache.delete("questions");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to answer question"
    );
  }
};

// Delete question
export const deleteQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/admin/questions/${questionId}`, {
      headers: getAuthHeaders(),
    });
    cache.delete("questions");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete question"
    );
  }
};

// Fetch stats
export const getStats = async () => {
  const cacheKey = "stats";
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await api.get(`/admin/stats`, {
      headers: getAuthHeaders(),
    });
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch stats");
  }
};

// Fetch detailed stats
export const getDetailedStats = async (period) => {
  const cacheKey = `detailedStats_${period}`;
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await api.get(`/admin/stats/detailed?period=${period}`, {
      headers: getAuthHeaders(),
    });
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch detailed stats"
    );
  }
};

// Fetch news stats
export const getNewsStats = async () => {
  const cacheKey = "newsStats";
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await api.get(`/admin/stats/news`, {
      headers: getAuthHeaders(),
    });
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch news stats"
    );
  }
};
