import api from "./api"

// Lấy danh sách bài đăng với bộ lọc nâng cao
export const getPosts = async (params = {}) => {
  try {
    const { page = 1, limit = 10, category, subject, status, search, sortBy, sortOrder } = params
    const query = new URLSearchParams({
      page,
      limit,
      ...(category && { category }),
      ...(subject && { subject }),
      ...(status && { status }),
      ...(search && { search }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
    }).toString()
    const response = await api.get(`/posts?${query}`)
    return response.data
  } catch (error) {
    console.error("Error fetching posts:", error)
    // Return empty data structure to prevent UI errors
    return { data: [], totalPages: 0 }
  }
}

// Lấy bài đăng theo ID
export const getPostById = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching post with ID ${postId}:`, error)
    throw new Error(error.response?.data?.message || "Không thể lấy bài đăng")
  }
}

// Tạo bài đăng mới
export const createPost = async (postData) => {
  try {
    const response = await api.post("/posts", postData)
    return response.data
  } catch (error) {
    console.error("Error creating post:", error)
    throw new Error(error.response?.data?.message || "Không thể tạo bài đăng")
  }
}

// Cập nhật bài đăng
export const updatePost = async (postId, postData) => {
  try {
    const response = await api.put(`/posts/${postId}`, postData)
    return response.data
  } catch (error) {
    console.error(`Error updating post with ID ${postId}:`, error)
    throw new Error(error.response?.data?.message || "Không thể cập nhật bài đăng")
  }
}

// Xóa bài đăng
export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}`)
    return response.data
  } catch (error) {
    console.error(`Error deleting post with ID ${postId}:`, error)
    throw new Error(error.response?.data?.message || "Không thể xóa bài đăng")
  }
}

// Toggle trạng thái thích bài đăng
export const toggleLikePost = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/like`)
    return response.data
  } catch (error) {
    console.error(`Error toggling like for post with ID ${postId}:`, error)
    throw new Error(error.response?.data?.message || "Không thể thích/bỏ thích bài đăng")
  }
}

// Toggle trạng thái bookmark bài đăng
export const toggleBookmarkPost = async (postId) => {
  try {
    // Kiểm tra xem bài đăng đã được bookmark chưa
    const bookmarks = await api.get(`/bookmarks?referenceType=post&referenceId=${postId}`)
    const isBookmarked = bookmarks.data.data.some((bookmark) => bookmark.referenceId === postId)

    let response
    if (isBookmarked) {
      // Nếu đã bookmark, gọi removeBookmark
      response = await api.delete(`/bookmarks/post/${postId}`)
    } else {
      // Nếu chưa bookmark, gọi addBookmark
      response = await api.post("/bookmarks", { referenceType: "post", referenceId: postId })
    }

    return { success: true, isBookmarked: !isBookmarked }
  } catch (error) {
    console.error(`Error toggling bookmark for post with ID ${postId}:`, error)
    throw new Error(error.response?.data?.message || "Không thể đánh dấu/bỏ đánh dấu bài đăng")
  }
}

// Lấy bài đăng đã bookmark
export const getBookmarkedPosts = async (params = {}) => {
  try {
    const { page = 1, limit = 10, search } = params
    const query = new URLSearchParams({
      page,
      limit,
      referenceType: "post",
      ...(search && { search }),
    }).toString()
    const response = await api.get(`/bookmarks?${query}`)
    return response.data
  } catch (error) {
    console.error("Error fetching bookmarked posts:", error)
    throw new Error(error.response?.data?.message || "Không thể lấy danh sách bài đăng đã bookmark")
  }
}

// Lấy bài đăng theo người dùng
export const getPostsByUser = async (userId, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching posts by user ${userId}:`, error)
    throw new Error(error.response?.data?.message || "Không thể lấy bài đăng của người dùng")
  }
}

// Cập nhật trạng thái bài đăng
export const updatePostStatus = async (postId, status) => {
  try {
    const response = await api.put(`/posts/${postId}/status`, { status })
    return response.data
  } catch (error) {
    console.error(`Error updating status for post with ID ${postId}:`, error)
    throw new Error(error.response?.data?.message || "Không thể cập nhật trạng thái bài đăng")
  }
}

// Cập nhật câu trả lời AI
export const updateAiResponse = async (postId, aiResponse) => {
  try {
    const response = await api.put(`/posts/${postId}/ai-response`, { aiResponse })
    return response.data
  } catch (error) {
    console.error(`Error updating AI response for post with ID ${postId}:`, error)
    throw new Error(error.response?.data?.message || "Không thể cập nhật câu trả lời AI")
  }
}

// Tải lên hình ảnh bài đăng
export const uploadPostImage = async (file) => {
  try {
    const formData = new FormData()
    formData.append("image", file)
    const response = await api.post("/posts/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Error uploading post image:", error)
    throw new Error(error.response?.data?.message || "Không thể tải lên hình ảnh")
  }
}

// Tải lên tệp bài đăng
export const uploadPostFile = async (file) => {
  try {
    const formData = new FormData()
    formData.append("file", file)
    const response = await api.post("/posts/upload-file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Error uploading post file:", error)
    throw new Error(error.response?.data?.message || "Không thể tải lên tệp")
  }
}

export default {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  toggleBookmarkPost,
  getBookmarkedPosts,
  getPostsByUser,
  updatePostStatus,
  updateAiResponse,
  uploadPostImage,
  uploadPostFile,
}
