"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { removeFromLibrary } from "../../services/libraryService"

// Custom hook to handle actions with loading state and confirmation
const useActionHandler = (actionFn, successMessage, errorMessagePrefix) => {
  const [loading, setLoading] = useState(false)

  const handleAction = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục này khỏi thư viện?")) return

    setLoading(true)
    try {
      await actionFn(id)
      toast.success(successMessage)
      return true
    } catch (error) {
      toast.error(`${errorMessagePrefix}: ${error.message || "Vui lòng thử lại."}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { handleAction, loading }
}

const LibraryTab = ({ libraryItems = [] }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [items, setItems] = useState(libraryItems)

  const { handleAction: handleRemoveItem, loading: removing } = useActionHandler(
    removeFromLibrary,
    "Đã xóa khỏi thư viện!",
    "Không thể xóa mục"
  )

  // Validate search query to prevent malicious input
  const handleSearchChange = (e) => {
    const query = e.target.value
    // Basic validation: prevent script tags or excessive length
    if (query.length > 100 || query.includes("<script")) {
      toast.error("Tìm kiếm không hợp lệ!")
      return
    }
    setSearchQuery(query)
  }

  // Handle item removal by updating state
  const onRemoveItem = async (itemId) => {
    const success = await handleRemoveItem(itemId)
    if (success) {
      setItems(items.filter((item) => item._id !== itemId))
    }
  }

  // Filter library items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || item.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="library-tab">
      <div className="library-header">
        <h2>Thư viện của tôi</h2>
        <div className="library-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm trong thư viện..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Tìm kiếm trong thư viện"
            />
            <i className="fas fa-search" aria-hidden="true"></i>
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === "all" ? "active" : ""}`}
              onClick={() => setFilterType("all")}
              aria-pressed={filterType === "all"}
            >
              Tất cả
            </button>
            <button
              className={`filter-btn ${filterType === "document" ? "active" : ""}`}
              onClick={() => setFilterType("document")}
              aria-pressed={filterType === "document"}
            >
              Tài liệu
            </button>
            <button
              className={`filter-btn ${filterType === "news" ? "active" : ""}`}
              onClick={() => setFilterType("news")}
              aria-pressed={filterType === "news"}
            >
              Tin tức
            </button>
          </div>
        </div>
      </div>

      <div className="library-content">
        {filteredItems.length > 0 ? (
          <div className="library-items">
            {filteredItems.map((item) => (
              <div key={item._id} className="library-item">
                <div className="item-icon">
                  <i
                    className={`fas ${item.type === "document" ? "fa-file-alt" : "fa-newspaper"}`}
                    aria-hidden="true"
                  ></i>
                </div>
                <div className="item-info">
                  <h3>{item.title}</h3>
                  {item.description && <p className="item-description">{item.description}</p>}
                  <div className="item-meta">
                    <span>
                      <i className="fas fa-calendar-alt" aria-hidden="true"></i>{" "}
                      {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span>
                      <i className="fas fa-tag" aria-hidden="true"></i>{" "}
                      {item.type === "document" ? "Tài liệu" : item.type === "news" ? "Tin tức" : item.type}
                    </span>
                  </div>
                </div>
                <div className="item-actions">
                  <Link
                    to={`/${item.type === "document" ? "documents" : "news"}/${item.itemId}`}
                    className="view-btn"
                    title="Xem"
                    aria-label={`Xem chi tiết ${item.title}`}
                  >
                    <i className="fas fa-eye" aria-hidden="true"></i>
                  </Link>
                  <button
                    className="remove-btn"
                    onClick={() => onRemoveItem(item._id)}
                    title="Xóa khỏi thư viện"
                    aria-label={`Xóa ${item.title} khỏi thư viện`}
                    disabled={removing}
                  >
                    {removing ? (
                      <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                    ) : (
                      <i className="fas fa-trash-alt" aria-hidden="true"></i>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>Không tìm thấy mục nào trong thư viện</p>
            <div className="no-data-actions">
              <Link to="/documents" className="btn-secondary" aria-label="Khám phá tài liệu">
                <i className="fas fa-book" aria-hidden="true"></i> Khám phá tài liệu
              </Link>
              <Link to="/news" className="btn-secondary" aria-label="Đọc tin tức">
                <i className="fas fa-newspaper" aria-hidden="true"></i> Đọc tin tức
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LibraryTab