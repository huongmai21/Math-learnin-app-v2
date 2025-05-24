import api from "./api";

export const addBookmark = async (referenceType, referenceId) => {
  const response = await api.post("/bookmarks", {
    referenceType,
    referenceId,
  });
  return response.data;
};

export const removeBookmark = async (referenceType, referenceId) => {
  const response = await api.delete("/bookmarks", {
    data: { referenceType, referenceId },
  });
  return response.data;
};

export const checkBookmarks = async (referenceType, referenceIds) => {
  const response = await api.post("/bookmarks/check", {
    referenceType,
    referenceIds,
  });
  return response.data;
};

export const getBookmarks = async (referenceType) => {
  const response = await api.get("/bookmarks", {
    params: { referenceType },
  });
  return response.data;
};