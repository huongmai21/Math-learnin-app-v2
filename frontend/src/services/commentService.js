import api from "./api"

// Lấy danh sách bình luận của bài đăng
export const getComments = async (postId) => {
  try {
    const response = await api.get(`/comments/post/${postId}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể lấy danh sách bình luận" }
  }
}

// Tạo bình luận mới
export const createComment = async (commentData) => {
  try {
    const response = await api.post("/comments", commentData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể tạo bình luận" }
  }
}

// Cập nhật bình luận
export const updateComment = async (id, commentData) => {
  try {
    const response = await api.put(`/comments/${id}`, commentData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể cập nhật bình luận" }
  }
}

// Xóa bình luận
export const deleteComment = async (id) => {
  try {
    const response = await api.delete(`/comments/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể xóa bình luận" }
  }
}

// Thích bình luận
export const likeComment = async (id) => {
  try {
    const response = await api.post(`/comments/${id}/like`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể thích bình luận" }
  }
}

// Trả lời bình luận
export const replyToComment = async (id, replyData) => {
  try {
    const response = await api.post(`/comments/${id}/reply`, replyData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể trả lời bình luận" }
  }
}

// Báo cáo bình luận
export const reportComment = async (id, reason) => {
  try {
    const response = await api.post(`/comments/${id}/report`, { reason })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể báo cáo bình luận" }
  }
}

// Lấy bình luận nổi bật
export const getFeaturedComments = async (postId, limit = 3) => {
  try {
    const response = await api.get(`/comments/post/${postId}/featured`, {
      params: { limit },
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể lấy bình luận nổi bật" }
  }
}
