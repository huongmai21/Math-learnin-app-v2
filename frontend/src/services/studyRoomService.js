import api from "./api"

// Lấy danh sách phòng học nhóm
export const getStudyRooms = async (params = {}) => {
  try {
    const response = await api.get("/study-room", { params })
    return response.data
  } catch (error) {
    console.error("Error fetching study rooms:", error)
    // Return empty data structure to prevent UI errors
    return { data: [], totalPages: 0 }
  }
}

// Lấy danh sách phòng học nhóm của người dùng hiện tại
export const getMyStudyRooms = async (params = {}) => {
  try {
    const response = await api.get("/study-room/my-rooms", { params })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể lấy danh sách phòng học nhóm của bạn" }
  }
}

// Lấy chi tiết phòng học nhóm
export const getStudyRoomById = async (id) => {
  try {
    const response = await api.get(`/study-room/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể lấy chi tiết phòng học nhóm" }
  }
}

// Tạo phòng học nhóm mới
export const createStudyRoom = async (roomData) => {
  try {
    const response = await api.post("/study-room", roomData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể tạo phòng học nhóm" }
  }
}

// Tham gia phòng học nhóm
export const joinStudyRoom = async (roomId, password = "") => {
  try {
    const response = await api.post(`/study-room/${roomId}/join`, { password })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể tham gia phòng học nhóm" }
  }
}

// Rời khỏi phòng học nhóm
export const leaveStudyRoom = async (roomId) => {
  try {
    const response = await api.post(`/study-room/${roomId}/leave`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể rời khỏi phòng học nhóm" }
  }
}

// Gửi tin nhắn trong phòng học nhóm
export const sendMessage = async (roomId, messageData) => {
  try {
    const response = await api.post(`/study-room/${roomId}/messages`, messageData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể gửi tin nhắn" }
  }
}

// Đóng phòng học nhóm
export const closeStudyRoom = async (roomId) => {
  try {
    const response = await api.post(`/study-room/${roomId}/close`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể đóng phòng học nhóm" }
  }
}
