import api from "./api"

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData)
    return response.data
  } catch (error) {
    console.error("Register error:", error)
    throw new Error(error.response?.data?.message || "Đăng ký thất bại")
  }
}

export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials)
    return response.data
  } catch (error) {
    console.error("Login error:", error)
    throw new Error(error.response?.data?.message || "Đăng nhập thất bại")
  }
}

export const refreshUser = async () => {
  try {
    const response = await api.get("/auth/me")
    return response.data.data
  } catch (error) {
    console.error("Refresh user error:", error)
    throw new Error(error.response?.data?.message || "Không thể lấy thông tin người dùng")
  }
}

export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", { email })
    return response.data
  } catch (error) {
    console.error("Forgot password error:", error)
    throw new Error(error.response?.data?.message || "Không thể gửi email đặt lại mật khẩu")
  }
}

export const resetPassword = async (token, password) => {
  try {
    const response = await api.post(`/auth/reset-password/${token}`, { password })
    return response.data
  } catch (error) {
    console.error("Reset password error:", error)
    throw new Error(error.response?.data?.message || "Không thể đặt lại mật khẩu")
  }
}

export const updateProfile = async (userData) => {
  try {
    const response = await api.put("/users/profile", userData)
    return response.data
  } catch (error) {
    console.error("Update profile error:", error)
    throw new Error(error.response?.data?.message || "Không thể cập nhật hồ sơ")
  }
}

export const changePassword = async (passwordData) => {
  try {
    const response = await api.put("/users/change-password", passwordData)
    return response.data
  } catch (error) {
    console.error("Change password error:", error)
    throw new Error(error.response?.data?.message || "Không thể thay đổi mật khẩu")
  }
}
