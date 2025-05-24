import api from "./api"

// Hàm tìm kiếm tài nguyên
export const searchResources = async (query) => {
  try {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`)
    return response.data
  } catch (error) {
    console.error("Error in searchResources:", error)
    throw error
  }
}

// Hàm tìm kiếm tất cả (cho Navbar)
export const searchAll = async (query) => {
  try {
    const response = await api.get(`/search/all?q=${encodeURIComponent(query)}`)
    return response.data
  } catch (error) {
    console.error("Error in searchAll:", error)
    throw error
  }
}

// Hàm tìm kiếm theo loại
export const searchByType = async (query, type) => {
  try {
    const response = await api.get(`/search/${type}?q=${encodeURIComponent(query)}`)
    return response.data
  } catch (error) {
    console.error(`Error in searchByType (${type}):`, error)
    throw error
  }
}

// Export default để tương thích với các import hiện tại
const searchService = {
  search: searchResources,
  searchAll,
  searchByType,
}

export default searchService
