import api from './api';

// Lấy danh sách tất cả đề thi (có phân trang, lọc, tìm kiếm)
export const getAllExams = async (params = {}) => {
  const response = await api.get('/exams', { params });
  return response.data;
};

// Quan tâm một đề thi
export const followExam = async (examId) => {
  const response = await api.post(`/exams/${examId}/follow`);
  return response.data;
};

// Lấy chi tiết một đề thi
export const getExamById = async (examId) => {
  const response = await api.get(`/exams/${examId}`);
  return response.data;
};

// Lấy đáp án của một đề thi
export const getExamAnswers = async (examId) => {
  const response = await api.get(`/exams/${examId}/answers`);
  return response.data;
};

// Lấy danh sách đề thi được đề xuất
export const getRecommendedExams = async () => {
  const response = await api.get('/exams/recommended');
  return response.data;
};

// Tạo một đề thi mới
export const createExam = async (examData) => {
  const response = await api.post('/exams', examData);
  return response.data;
};

// Cập nhật một đề thi
export const updateExam = async (examId, examData) => {
  const response = await api.put(`/exams/${examId}`, examData);
  return response.data;
};

// Xóa một đề thi
export const deleteExam = async (examId) => {
  const response = await api.delete(`/exams/${examId}`);
  return response.data;
};

// Lấy danh sách đề thi do người dùng tạo
export const getMyExams = async (authorId) => {
  const response = await api.get(`/exams?author=${authorId}`);
  return response.data;
};

// Nộp bài thi
export const submitExam = async (examId, answers) => {
  const response = await api.post(`/exams/${examId}/submit`, { answers });
  return response.data;
};

// Lấy bảng xếp hạng toàn cầu
export const getGlobalLeaderboard = async (params = {}) => {
  const response = await api.get('/exams/leaderboard/global', { params });
  return response.data;
};

// Lấy bảng xếp hạng của một đề thi cụ thể
export const getExamLeaderboard = async (examId) => {
  const response = await api.get(`/exams/${examId}/leaderboard`);
  return response.data;
};