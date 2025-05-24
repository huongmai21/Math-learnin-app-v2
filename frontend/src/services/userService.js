import api from "./api"

// Lấy thông tin hồ sơ người dùng
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId || "profile"}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy thông tin hồ sơ")
  }
}

// Cập nhật thông tin hồ sơ người dùng
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put("/users/profile", userData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể cập nhật hồ sơ")
  }
}

// Lấy danh sách người theo dõi
export const getFollowers = async (userId) => {
  try {
    const response = await api.get(`/users/${userId || "me"}/followers`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy danh sách người theo dõi")
  }
}

// Lấy danh sách đang theo dõi
export const getFollowing = async (userId) => {
  try {
    const response = await api.get(`/users/${userId || "me"}/following`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy danh sách đang theo dõi")
  }
}

// Theo dõi người dùng
export const followUser = async (userId) => {
  try {
    const response = await api.post(`/users/${userId}/follow`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể theo dõi người dùng")
  }
}

// Hủy theo dõi người dùng
export const unfollowUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}/follow`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể hủy theo dõi người dùng")
  }
}

// Lấy thư viện của người dùng
export const getLibrary = async () => {
  try {
    const response = await api.get("/users/library")
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy thư viện")
  }
}

// Lấy bài đăng của người dùng
export const getPosts = async (userId) => {
  try {
    const response = await api.get(`/users/${userId || "me"}/posts`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy bài đăng")
  }
}

// Lấy điểm số của người dùng
export const getScores = async (userId) => {
  try {
    const response = await api.get(`/users/${userId || "me"}/scores`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy điểm số")
  }
}

// Lấy đóng góp của người dùng
export const getContributions = async (userId) => {
  try {
    const response = await api.get(`/users/${userId || "me"}/contributions`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy đóng góp")
  }
}

// Lấy khóa học đã đăng ký
export const getEnrolledCourses = async () => {
  try {
    const response = await api.get("/users/enrolled-courses")
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy khóa học đã đăng ký")
  }
}

// Thay đổi mật khẩu
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put("/users/change-password", passwordData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể thay đổi mật khẩu")
  }
}

// Tải lên ảnh đại diện
export const uploadAvatar = async (formData) => {
  try {
    const response = await api.post("/users/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải lên ảnh đại diện")
  }
}

// Tải lên ảnh bìa
export const uploadCoverImage = async (formData) => {
  try {
    const response = await api.post("/users/upload-cover", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải lên ảnh bìa")
  }
}
