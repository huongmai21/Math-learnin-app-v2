import api from "./api"

// Thêm cơ chế retry cho các request
const withRetry = async (fn, maxRetries = 2) => {
  let retries = 0
  while (retries < maxRetries) {
    try {
      return await fn()
    } catch (error) {
      retries++
      console.log(`Attempt ${retries} failed. ${maxRetries - retries} attempts left.`)
      if (retries === maxRetries) throw error
      // Đợi một khoảng thời gian trước khi thử lại
      await new Promise((resolve) => setTimeout(resolve, 1000 * retries))
    }
  }
}

export const getDocuments = async (params = {}) => {
  return withRetry(async () => {
    const response = await api.get("/documents", { params })
    return response.data
  })
}

export const getDocumentById = async (id) => {
  return withRetry(async () => {
    const response = await api.get(`/documents/${id}`)
    return response.data
  })
}

export const createDocument = async (documentData) => {
  const formData = new FormData()

  // Thêm các trường dữ liệu vào formData
  Object.keys(documentData).forEach((key) => {
    if (key !== "file" && key !== "thumbnail") {
      formData.append(key, documentData[key])
    }
  })

  // Thêm file và thumbnail nếu có
  if (documentData.file) {
    formData.append("file", documentData.file)
  }

  if (documentData.thumbnail) {
    formData.append("thumbnail", documentData.thumbnail)
  }

  return withRetry(async () => {
    const response = await api.post("/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  })
}

export const updateDocument = async (id, documentData) => {
  const formData = new FormData()

  // Thêm các trường dữ liệu vào formData
  Object.keys(documentData).forEach((key) => {
    if (key !== "file" && key !== "thumbnail") {
      formData.append(key, documentData[key])
    }
  })

  // Thêm file và thumbnail nếu có
  if (documentData.file) {
    formData.append("file", documentData.file)
  }

  if (documentData.thumbnail) {
    formData.append("thumbnail", documentData.thumbnail)
  }

  return withRetry(async () => {
    const response = await api.put(`/documents/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  })
}

export const deleteDocument = async (id) => {
  return withRetry(async () => {
    const response = await api.delete(`/documents/${id}`)
    return response.data
  })
}

export const downloadDocument = async (id) => {
  return withRetry(async () => {
    const response = await api.get(`/documents/${id}/download`)
    return response.data
  })
}

export const searchDocuments = async (query) => {
  return withRetry(async () => {
    const response = await api.get(`/documents/search`, {
      params: { q: query },
    })
    return response.data
  })
}

export const getPopularDocuments = async (params = {}) => {
  return withRetry(async () => {
    const response = await api.get("/documents/popular", { params })
    return response.data
  })
}

export const getRelatedDocuments = async (params = {}) => {
  return withRetry(async () => {
    const response = await api.get("/documents/related", { params })
    return response.data
  })
}

export const convertDocumentFormat = async (id, format) => {
  return withRetry(async () => {
    const response = await api.get(`/documents/${id}/convert`, {
      params: { format },
      responseType: "blob",
    })
    return response.data
  })
}
