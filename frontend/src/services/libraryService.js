import api from "./api"

// Lấy danh sách mục trong thư viện
export const getLibraryItems = async () => {
  try {
    const response = await api.get("/library")
    return response.data
  } catch (error) {
    throw error
  }
}

// Thêm mục vào thư viện
export const addToLibrary = async (itemData) => {
  try {
    const response = await api.post("/library", itemData)
    return response.data
  } catch (error) {
    throw error
  }
}

// Xóa mục khỏi thư viện
export const removeFromLibrary = async (itemId) => {
  try {
    const response = await api.delete(`/library/${itemId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export default {
  getLibraryItems,
  addToLibrary,
  removeFromLibrary,
}
