"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { removeFromLibrary } from "../../services/libraryService"

const LibraryTab = ({ libraryItems = [] }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục này khỏi thư viện?")) return

    try {
      await removeFromLibrary(itemId)
      toast.success("Đã xóa khỏi thư viện!")
      // Reload page to see changes
      window.location.reload()
    } catch (error) {
      toast.error("Không thể xóa mục: " + (error.message || "Vui lòng thử lại."))
    }
  }

  // Lọc các mục thư viện
  const filteredItems = libraryItems.filter((item) => {
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === "all" ? "active" : ""}`}
              onClick={() => setFilterType("all")}
            >
              Tất cả
            </button>
            <button
              className={`filter-btn ${filterType === "document" ? "active" : ""}`}
              onClick={() => setFilterType("document")}
            >
              Tài liệu
            </button>
            <button
              className={`filter-btn ${filterType === "news" ? "active" : ""}`}
              onClick={() => setFilterType("news")}
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
                  <i className={`fas ${item.type === "document" ? "fa-file-alt" : "fa-newspaper"}`}></i>
                </div>
                <div className="item-info">
                  <h3>{item.title}</h3>
                  {item.description && <p className="item-description">{item.description}</p>}
                  <div className="item-meta">
                    <span>
                      <i className="fas fa-calendar-alt"></i>{" "}
                      {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span>
                      <i className="fas fa-tag"></i>{" "}
                      {item.type === "document" ? "Tài liệu" : item.type === "news" ? "Tin tức" : item.type}
                    </span>
                  </div>
                </div>
                <div className="item-actions">
                  <Link
                    to={`/${item.type === "document" ? "documents" : "news"}/${item.itemId}`}
                    className="view-btn"
                    title="Xem"
                  >
                    <i className="fas fa-eye"></i>
                  </Link>
                  <button className="remove-btn" onClick={() => handleRemoveItem(item._id)} title="Xóa khỏi thư viện">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>Không tìm thấy mục nào trong thư viện</p>
            <div className="no-data-actions">
              <Link to="/documents" className="btn-secondary">
                <i className="fas fa-book"></i> Khám phá tài liệu
              </Link>
              <Link to="/news" className="btn-secondary">
                <i className="fas fa-newspaper"></i> Đọc tin tức
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LibraryTab
