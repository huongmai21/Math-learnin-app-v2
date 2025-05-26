import api from './api';

// Lấy danh sách tất cả đề thi (có phân trang, lọc, tìm kiếm)
export const getAllExams = async (params = {}) => {
  try {
    const response = await api.get("/exams", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching exams:", error);
    const message =
      error.response?.status === 404
        ? "Không tìm thấy bài thi"
        : error.response?.status === 403
        ? "Bạn không có quyền truy cập"
        : "Không thể lấy danh sách bài thi";
    throw new Error(error.response?.data?.message || message);
  }
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

// Lấy danh sách câu hỏi của bài thi
export const getExamQuestions = async (params = {}) => {
  try {
    const response = await api.get("/exams/questions", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching exam questions:", error);
    throw new Error(
      error.response?.data?.message || "Không thể lấy danh sách câu hỏi"
    );
  }
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

// Lấy danh sách bài nôp của một đề thi
export const getExamSubmissions = async (examId) => {
  const response = await api.get(`/exams/${examId}/submissions`);
  return response.data;
};

export const handleReminder = async (examId) => {
  try {
    const response = await api.post(`/exams/${examId}/reminder`);
    toast.success("Đã bật nhắc nhở cho bài thi!");
  } catch (err) {
    toast.error(err.response?.data?.message || "Không thể bật nhắc nhở!");
  }
};