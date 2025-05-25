import api from "./api";

// Lấy điểm số
export const getScores = async () => {
  try {
    const response = await api.get("/users/profile/scores");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể lấy điểm số"
    );
  }
};

// Lấy danh sách tài liệu/thư viện
export const getBookmarks = async () => {
  try {
    const response = await api.get("/users/profile/library");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể lấy thư viện"
    );
  }
};

// Lấy danh sách bài đăng
export const getPosts = async () => {
  try {
    const response = await api.get("/users/profile/posts");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể lấy bài đăng"
    );
  }
};

// Lấy danh sách khóa học
export const getCourses = async () => {
  try {
    const response = await api.get("/users/profile/courses");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể lấy khóa học"
    );
  }
};

// Lấy danh sách đề thi đã tham gia
export const getParticipatedExams = async () => {
  try {
    const response = await api.get("/users/profile/participated-exams");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể lấy danh sách đề thi đã tham gia"
    );
  }
};

// Thêm tài liệu/thư viện
export const addBookmark = async (itemData) => {
  try {
    const response = await api.post("/users/profile/library", itemData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể thêm vào thư viện"
    );
  }
};

// Tạo bài đăng
export const createPost = async (postData) => {
  try {
    const response = await api.post("/users/profile/posts", postData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể tạo bài đăng"
    );
  }
};

// Tạo khóa học
export const createCourse = async (courseData) => {
  try {
    const response = await api.post("/users/profile/courses", courseData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể tạo khóa học"
    );
  }
};