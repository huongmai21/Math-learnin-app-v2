import api from "./api";

// Lấy thông tin hồ sơ người dùng
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/profile`);
    console.log("API response:", response.data); // Thêm log để kiểm tra
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể lấy thông tin hồ sơ"
    );
  }
};

// Cập nhật thông tin hồ sơ người dùng
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put("/users/profile", userData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể cập nhật hồ sơ"
    );
  }
};

// Lấy danh sách người theo dõi
export const getFollowers = async () => {
  try {
    const response = await api.get("/users/followers");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể lấy danh sách người theo dõi"
    );
  }
};


// Lấy danh sách đang theo dõi
export const getFollowing = async () => {
  try {
    const response = await api.get("/users/following");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể lấy danh sách đang theo dõi"
    );
  }
};

// Theo dõi người dùng
export const followUser = async (userId) => {
  try {
    const response = await api.put(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể theo dõi người dùng"
    );
  }
};

// Hủy theo dõi người dùng
export const unfollowUser = async (userId) => {
  try {
    const response = await api.put(`/users/${userId}/unfollow`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể hủy theo dõi người dùng"
    );
  }
};

// Lấy thư viện của người dùng
export const getLibrary = async () => {
  try {
    const response = await api.get("/users/profile/library");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể lấy thư viện"
    );
  }
};

// Lấy bài đăng của người dùng
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

// Lấy điểm số của người dùng
export const getScores = async (userId) => {
  try {
    const response = await api.get(`/users/profile/scores`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy điểm số");
  }
};

// Lấy đóng góp của người dùng
export const getContributions = async (userId) => {
  try {
    const response = await api.get(`/users/activity`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy đóng góp");
  }
};

// Lấy khóa học đã đăng ký
export const getEnrolledCourses = async () => {
  try {
    const response = await api.get("/users/enrolled-courses");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể lấy khóa học đã đăng ký"
    );
  }
};

// Thay đổi mật khẩu
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put("/users/change-password", passwordData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể thay đổi mật khẩu"
    );
  }
};
