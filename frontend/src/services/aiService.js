import api from "./api";

// Hỏi câu hỏi toán học
export const askMathQuestion = async (question) => {
  try {
    const response = await api.post("/ai/math-question", { question });
    return response.data; // Trả về dữ liệu từ response
  } catch (error) {
    console.error("Error asking math question:", error);
    throw new Error(error.response?.data?.message || "Không thể giải bài toán");
  }
};

// Lấy lịch sử hỏi đáp
export const getMathHistory = async () => {
  try {
    const response = await api.get("/ai/history");
    return response.data;
  } catch (error) {
    console.error("Error getting math history:", error);
    throw new Error(error.response?.data?.message || "Không thể lấy lịch sử hỏi đáp");
  }
};

// Tạo đề thi tự động
export const generateExam = async (params) => {
  try {
    const response = await api.post("/ai/generate-exam", params);
    return response.data;
  } catch (error) {
    console.error("Error generating exam:", error);
    throw new Error(error.response?.data?.message || "Không thể tạo đề thi");
  }
};

// Phân tích kết quả thi
export const analyzeExamResult = async (examResultId) => {
  try {
    const response = await api.get(`/ai/analyze-exam/${examResultId}`);
    return response.data;
  } catch (error) {
    console.error("Error analyzing exam result:", error);
    throw new Error(error.response?.data?.message || "Không thể phân tích kết quả thi");
  }
};

// Gợi ý tài liệu học tập
export const suggestLearningMaterials = async (topic) => {
  try {
    const response = await api.post("/ai/suggest-materials", { topic });
    return response.data;
  } catch (error) {
    console.error("Error suggesting learning materials:", error);
    throw new Error(error.response?.data?.message || "Không thể gợi ý tài liệu học tập");
  }
};

// Tạo mô phỏng toán học
export const createMathSimulation = async (params) => {
  try {
    const response = await api.post("/ai/create-simulation", params);
    return response.data;
  } catch (error) {
    console.error("Error creating math simulation:", error);
    throw new Error(error.response?.data?.message || "Không thể tạo mô phỏng toán học");
  }
};

export default {
  askMathQuestion,
  getMathHistory,
  generateExam,
  analyzeExamResult,
  suggestLearningMaterials,
  createMathSimulation,
};