import api from "./api"

// Lấy thành tích của người dùng
export const getUserAchievements = async (userId) => {
  try {
    const response = await api.get(`/achievements/user/${userId}`)
    return response.data
  } catch (error) {
    console.error("Error in getUserAchievements:", error)
    throw error
  }
}

// Nhận phần thưởng từ thành tích
export const claimAchievementReward = async (achievementId) => {
  try {
    const response = await api.post(`/achievements/${achievementId}/claim`)
    return response.data
  } catch (error) {
    console.error("Error in claimAchievementReward:", error)
    throw error
  }
}

// Lấy danh sách tất cả thành tích
export const getAllAchievements = async () => {
  try {
    const response = await api.get("/achievements")
    return response.data
  } catch (error) {
    console.error("Error in getAllAchievements:", error)
    throw error
  }
}

// Lấy thông tin chi tiết thành tích
export const getAchievementDetails = async (achievementId) => {
  try {
    const response = await api.get(`/achievements/${achievementId}`)
    return response.data
  } catch (error) {
    console.error("Error in getAchievementDetails:", error)
    throw error
  }
}

export default {
  getUserAchievements,
  claimAchievementReward,
  getAllAchievements,
  getAchievementDetails,
}
