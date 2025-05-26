import api from "./api";

// Hàm retry để thử lại API khi thất bại
const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Lấy tất cả khóa học
export const getAllCourses = async (params = {}) => {
  try {
    const response = await retry(() => api.get("/courses", { params }));
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw new Error(
      error.response?.data?.message || "Không thể lấy danh sách khóa học"
    );
  }
};

// Lấy khóa học theo ID
export const getCourse = async (id) => {
  try {
    const response = await retry(() => api.get(`/courses/${id}`));
    return response.data;
  } catch (error) {
    console.error("Error fetching course details:", error);
    throw new Error(
      error.response?.data?.message || "Không thể lấy thông tin khóa học"
    );
  }
};

// Lấy khóa học liên quan
export const getRelatedCourses = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/related`);
  return response.data;
};

// Tạo khóa học mới
export const createCourse = async (courseData) => {
  try {
    const response = await api.post(`/courses`, courseData);
    return response.data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw new Error(error.response?.data?.message || "Không thể tạo khóa học");
  }
};

// Cập nhật khóa học
export const updateCourse = async (id, courseData) => {
  try {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw new Error(
      error.response?.data?.message || "Không thể cập nhật khóa học"
    );
  }
};

// Xóa khóa học
export const deleteCourse = async (id) => {
  try {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw new Error(error.response?.data?.message || "Không thể xóa khóa học");
  }
};

// Duyệt khóa học
export const approveCourse = async (courseId) => {
  try {
    const response = await api.put(`/courses/${courseId}/approve`);
    return response.data;
  } catch (error) {
    console.error("Error approving course:", error);
    throw new Error(
      error.response?.data?.message || "Không thể duyệt khóa học"
    );
  }
};

// Từ chối khóa học
export const rejectCourse = async (courseId) => {
  try {
    const response = await api.put(`/courses/${courseId}/reject`);
    return response.data;
  } catch (error) {
    console.error("Error rejecting course:", error);
    throw new Error(
      error.response?.data?.message || "Không thể từ chối khóa học"
    );
  }
};

// Lấy khóa học của tôi
export const getMyCourses = async () => {
  try {
    const response = await api.get("/courses/my-courses");
    return response.data;
  } catch (error) {
    console.error("Error fetching my courses:", error);
    throw new Error(
      error.response?.data?.message || "Không thể lấy khóa học của bạn"
    );
  }
};

// Đăng ký khóa học
export const enrollCourse = async (courseId) => {
  try {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  } catch (error) {
    console.error("Error enrolling course:", error);
    throw new Error(
      error.response?.data?.message || "Không thể đăng ký khóa học"
    );
  }
};

// Hủy đăng ký khóa học
export const unenrollCourse = async (courseId) => {
  try {
    const response = await api.delete(`/courses/${courseId}/enroll`);
    return response.data;
  } catch (error) {
    console.error("Error unenrolling course:", error);
    throw new Error(
      error.response?.data?.message || "Không thể hủy đăng ký khóa học"
    );
  }
};

// Lấy danh sách học viên của khóa học
export const getCourseEnrollments = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/enrollments`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course enrollments:", error);
    throw new Error(
      error.response?.data?.message || "Không thể lấy danh sách học viên"
    );
  }
};

// Tạo payment intent
export const createPaymentIntent = async (courseId, amount) => {
  try {
    const response = await api.post(`/courses/${courseId}/payment`, { amount });
    return response.data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tạo thanh toán"
    );
  }
};

// Xác nhận thanh toán
export const confirmPayment = async (courseId, paymentIntentId) => {
  try {
    const response = await api.post(`/courses/${courseId}/confirm-payment`, { paymentIntentId });
    return response.data;
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw new Error(
      error.response?.data?.message || "Không thể xác nhận thanh toán"
    );
  }
};

// Thêm nội dung khóa học
export const addCourseContent = async (courseId, contentData) => {
  try {
    const response = await api.post(`/courses/${courseId}/contents`, contentData);
    return response.data;
  } catch (error) {
    console.error("Error adding course content:", error);
    throw new Error(error.response?.data?.message || "Không thể thêm nội dung");
  }
};

// Cập nhật nội dung khóa học
export const updateCourseContent = async (courseId, contentId, contentData) => {
  try {
    const response = await api.put(`/courses/${courseId}/contents/${contentId}`, contentData);
    return response.data;
  } catch (error) {
    console.error("Error updating course content:", error);
    throw new Error(error.response?.data?.message || "Không thể cập nhật nội dung");
  }
};

// Xóa nội dung khóa học
export const deleteCourseContent = async (courseId, contentId) => {
  try {
    const response = await api.delete(`/courses/${courseId}/contents/${contentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting course content:", error);
    throw new Error(error.response?.data?.message || "Không thể xóa nội dung");
  }
};

// Cập nhật tiến độ học tập
export const updateProgress = async (courseId, contentId, completed) => {
  try {
    const response = await api.post(`/courses/${courseId}/progress`, {
      contentId,
      completed,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating progress:", error);
    throw new Error(
      error.response?.data?.message || "Không thể cập nhật tiến độ học tập"
    );
  }
};

// Đánh giá khóa học
export const createReview = async (courseId, reviewData) => {
  try {
    const response = await api.post(`/courses/${courseId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw new Error(
      error.response?.data?.message || "Không thể đánh giá khóa học"
    );
  }
};

// Lấy đánh giá của khóa học
export const getCourseReviews = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/reviews`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course reviews:", error);
    throw new Error(
      error.response?.data?.message || "Không thể lấy đánh giá khóa học"
    );
  }
};

// Lấy khóa học nổi bật cho trang chủ
export const getCoursesPress = async ({ limit = 3 } = {}) => {
  const controller = new AbortController();
  try {
    const response = await retry(() =>
      api.get("/courses", {
        params: { limit, featured: true, status: "approved" },
        signal: controller.signal,
      })
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    if (error.name === "AbortError") {
      return { success: true, count: 0, data: [], message: "Yêu cầu bị hủy" };
    }
    throw new Error("Không thể tải khóa học nổi bật");
  } finally {
    controller.abort();
  }
};

// Tạo bài thi cho khóa học
export const createExamForCourse = async (courseId, examData) => {
  try {
    const response = await api.post(`/exams/courses/${courseId}/exams`, examData);
    return response.data;
  } catch (error) {
    console.error("Error creating exam for course:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tạo bài thi cho khóa học"
    );
  }
};

// Tham gia bài thi
export const takeExam = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}/take`);
    return response.data;
  } catch (error) {
    console.error("Error taking exam:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tham gia bài thi"
    );
  }
};

// Nôp bài thi
export const submitExam = async (examId, answers) => {
  try {
    const response = await api.post(`/exams/${examId}/submit`, { answers });
    return response.data;
  } catch (error) {
    console.error("Error submitting exam:", error);
    throw new Error(error.response?.data?.message || "Không thể nộp bài thi");
  }
};

//Chấm điểm bài thi
export const updateSubmissionScore = async (examId, submissionId, grades) => {
  try {
    const response = await api.put(`/exams/${examId}/submissions/${submissionId}/grade`, grades);
    return response.data;
  } catch (error) {
    console.error("Error updating submission score:", error);
    throw new Error(error.response?.data?.message || "Không thể chấm điểm");
  }
};

// Lấy danh sách bài thi của khóa học
export const getExamsByCourse = async (courseId) => {
  try {
    const response = await api.get(`/exams/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching exams for course:", error);
    throw new Error(
      error.response?.data?.message || "Không thể lấy danh sách bài thi"
    );
  }
};

// Thêm câu hỏi vào bài thi
export const addQuestionToExam = async (examId, questionData) => {
  try {
    const response = await api.post(`/exams/${examId}/questions`, questionData);
    return response.data;
  } catch (error) {
    console.error("Error adding question to exam:", error);
    throw new Error(error.response?.data?.message || "Không thể thêm câu hỏi");
  }
};

// Cập nhật câu hỏi trong bài thi
export const updateQuestionInExam = async (examId, questionId, questionData) => {
  try {
    const response = await api.put(`/exams/${examId}/questions/${questionId}`, questionData);
    return response.data;
  } catch (error) {
    console.error("Error updating question in exam:", error);
    throw new Error(error.response?.data?.message || "Không thể cập nhật câu hỏi");
  }
};

// Xóa câu hỏi khỏi bài thi
export const deleteQuestionFromExam = async (examId, questionId) => {
  try {
    const response = await api.delete(`/exams/${examId}/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting question from exam:", error);
    throw new Error(error.response?.data?.message || "Không thể xóa câu hỏi");
  }
};