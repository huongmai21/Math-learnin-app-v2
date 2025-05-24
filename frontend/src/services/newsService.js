import api from "./api"

// Lấy danh sách tin tức
export const getNews = async (page = 1, search = "", category = "") => {
  try {
    const response = await api.get("/news", {
      params: { page, search, category },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching news:", error)
    throw new Error(error.response?.data?.message || "Không thể tải tin tức")
  }
}

// Lấy chi tiết tin tức theo ID
export const getNewsById = async (id) => {
  try {
    const response = await api.get(`/news/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching news details:", error)
    throw new Error(error.response?.data?.message || "Không thể tải chi tiết tin tức")
  }
}

// Lấy gợi ý tin tức
export const getNewsSuggestions = async (query) => {
  try {
    const response = await api.get("/news/suggestions", {
      params: { query },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching news suggestions:", error)
    throw new Error(error.response?.data?.message || "Không thể tải gợi ý tin tức")
  }
}

// Lấy tin tức nổi bật cho trang chủ
export const getNewsPress = async ({ limit = 3 } = {}) => {
  const controller = new AbortController();
  try {
    const response = await api.get("/news/featured", {
      params: { limit },
      signal: controller.signal,
    });
    return response.data;
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Request was cancelled");
      return { success: false, news: [] };
    }
    console.error("Error fetching featured news:", error);
    if (error.response?.status === 200 && error.response?.data?.news) {
      return {
        success: true,
        count: 0,
        news: [],
        message: "Không có tin tức nổi bật",
      };
    }
    throw new Error("Không thể tải tin tức nổi bật");
  } finally {
    controller.abort();
  }
};

// Cập nhật tin tức
export const updateNews = async (id, data) => {
  try {
    const response = await api.put(`/news/update/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating news:", error);
    throw new Error(error.response?.data?.message || "Không thể cập nhật tin tức");
  }
}