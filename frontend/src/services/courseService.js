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
export const getCourseById = async (id) => {
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

// Tạo khóa học mới
export const createCourse = async (courseData) => {
  try {
    const response = await api.post("/courses", courseData);
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

// Lấy bài học của khóa học
export const getCourseLessons = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/lessons`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course lessons:", error);
    throw new Error(error.response?.data?.message || "Không thể lấy bài học");
  }
};

// Tạo bài học mới
export const createLesson = async (courseId, lessonData) => {
  try {
    const response = await api.post(`/courses/${courseId}/lessons`, lessonData);
    return response.data;
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw new Error(error.response?.data?.message || "Không thể tạo bài học");
  }
};

// Cập nhật bài học
export const updateLesson = async (courseId, lessonId, lessonData) => {
  try {
    const response = await api.put(
      `/courses/${courseId}/lessons/${lessonId}`,
      lessonData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw new Error(
      error.response?.data?.message || "Không thể cập nhật bài học"
    );
  }
};

// Xóa bài học
export const deleteLesson = async (courseId, lessonId) => {
  try {
    const response = await api.delete(
      `/courses/${courseId}/lessons/${lessonId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw new Error(error.response?.data?.message || "Không thể xóa bài học");
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
    if (error.response?.status === 200 && error.response?.data?.data) {
      return {
        success: true,
        count: 0,
        data: [],
        message: "Không có khóa học nổi bật",
      };
    }
    throw new Error("Không thể tải khóa học nổi bật");
  } finally {
    controller.abort();
  }
};;
