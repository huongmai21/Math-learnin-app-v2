"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getDocuments, getPopularDocuments } from "../../services/documentService"
import SearchBar from "../../components/common/SearchBar/SearchBar"
import Spinner from "../../components/ui/Spinner"
import "./Document.css"

const DocumentList = ({ educationLevel }) => {
  const [documents, setDocuments] = useState([])
  const [popularDocuments, setPopularDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    educationLevel: educationLevel || "all",
    subject: "all",
    sort: "newest",
  })

  const location = useLocation()
  const navigate = useNavigate()

  // Lấy query params từ URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const educationLevelParam = searchParams.get("educationLevel") || educationLevel || "all"
    const subjectParam = searchParams.get("subject") || "all"
    const sortParam = searchParams.get("sort") || "newest"

    setCurrentPage(page)
    setFilters({
      educationLevel: educationLevelParam,
      subject: subjectParam,
      sort: sortParam,
    })
  }, [location.search, educationLevel])

  // Fetch documents dựa trên filters và pagination
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true)
      try {
        // Tạo query params
        const params = {
          page: currentPage,
          limit: 12,
          ...filters,
        }

        // Fetch documents
        const data = await getDocuments(params)
        setDocuments(data.documents || [])
        setTotalPages(data.totalPages || 1)

        // Fetch popular documents nếu đang ở trang đầu tiên
        if (currentPage === 1) {
          const popularData = await getPopularDocuments({ limit: 5 })
          setPopularDocuments(popularData.documents || [])
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching documents:", err)
        setError("Không thể tải danh sách tài liệu. Vui lòng thử lại sau.")
        toast.error("Không thể tải danh sách tài liệu")
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [currentPage, filters])

  // Cập nhật URL khi filters hoặc pagination thay đổi
  useEffect(() => {
    const searchParams = new URLSearchParams()
    if (currentPage > 1) searchParams.set("page", currentPage.toString())
    if (filters.educationLevel !== "all") searchParams.set("educationLevel", filters.educationLevel)
    if (filters.subject !== "all") searchParams.set("subject", filters.subject)
    if (filters.sort !== "newest") searchParams.set("sort", filters.sort)

    const newSearch = searchParams.toString() ? `?${searchParams.toString()}` : ""
    navigate(`${location.pathname}${newSearch}`, { replace: true })
  }, [currentPage, filters, navigate, location.pathname])

  const handleFilterChange = (filterType, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }))
    setCurrentPage(1) // Reset về trang đầu tiên khi thay đổi filter
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}&type=document`)
  }

  // Render loading state
  if (loading && currentPage === 1) {
    return (
      <div className="document-list-container">
        <div className="document-header">
          <h1>Tài liệu học tập</h1>
          <SearchBar placeholder="Tìm kiếm tài liệu..." onSearch={handleSearch} />
        </div>
        <div className="document-filters">
          <div className="filter-group">
            <label>Cấp học:</label>
            <select
              value={filters.educationLevel}
              onChange={(e) => handleFilterChange("educationLevel", e.target.value)}
              disabled={loading}
            >
              <option value="all">Tất cả</option>
              <option value="primary">Tiểu học</option>
              <option value="secondary">THCS</option>
              <option value="highschool">THPT</option>
              <option value="university">Đại học</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Môn học:</label>
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange("subject", e.target.value)}
              disabled={loading}
            >
              <option value="all">Tất cả</option>
              <option value="math">Toán học</option>
              <option value="physics">Vật lý</option>
              <option value="chemistry">Hóa học</option>
              <option value="biology">Sinh học</option>
              <option value="literature">Ngữ văn</option>
              <option value="english">Tiếng Anh</option>
              <option value="history">Lịch sử</option>
              <option value="geography">Địa lý</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sắp xếp:</label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              disabled={loading}
            >
              <option value="newest">Mới nhất</option>
              <option value="popular">Phổ biến nhất</option>
              <option value="rating">Đánh giá cao</option>
            </select>
          </div>
        </div>
        <div className="loading-container">
          <Spinner />
          <p>Đang tải tài liệu...</p>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="document-list-container">
        <div className="document-header">
          <h1>Tài liệu học tập</h1>
          <SearchBar placeholder="Tìm kiếm tài liệu..." onSearch={handleSearch} />
        </div>
        <div className="error-container">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="document-list-container">
      <div className="document-header">
        <h1>Tài liệu học tập</h1>
        <SearchBar placeholder="Tìm kiếm tài liệu..." onSearch={handleSearch} />
      </div>

      <div className="document-filters">
        <div className="filter-group">
          <label>Cấp học:</label>
          <select
            value={filters.educationLevel}
            onChange={(e) => handleFilterChange("educationLevel", e.target.value)}
            disabled={loading}
          >
            <option value="all">Tất cả</option>
            <option value="primary">Tiểu học</option>
            <option value="secondary">THCS</option>
            <option value="highschool">THPT</option>
            <option value="university">Đại học</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Môn học:</label>
          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange("subject", e.target.value)}
            disabled={loading}
          >
            <option value="all">Tất cả</option>
            <option value="math">Toán học</option>
            <option value="physics">Vật lý</option>
            <option value="chemistry">Hóa học</option>
            <option value="biology">Sinh học</option>
            <option value="literature">Ngữ văn</option>
            <option value="english">Tiếng Anh</option>
            <option value="history">Lịch sử</option>
            <option value="geography">Địa lý</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sắp xếp:</label>
          <select value={filters.sort} onChange={(e) => handleFilterChange("sort", e.target.value)} disabled={loading}>
            <option value="newest">Mới nhất</option>
            <option value="popular">Phổ biến nhất</option>
            <option value="rating">Đánh giá cao</option>
          </select>
        </div>
      </div>

      {currentPage === 1 && popularDocuments.length > 0 && (
        <div className="popular-documents">
          <h2>Tài liệu nổi bật</h2>
          <div className="popular-documents-grid">
            {popularDocuments.map((doc) => (
              <Link to={`/documents/${doc._id}`} key={doc._id} className="popular-document-card">
                <div className="popular-document-thumbnail">
                  <img src={doc.thumbnail || "/placeholder.svg?height=150&width=250"} alt={doc.title} loading="lazy" />
                  <div className="popular-document-badge">
                    <i className="fas fa-star"></i> Nổi bật
                  </div>
                </div>
                <div className="popular-document-content">
                  <h3>{doc.title}</h3>
                  <p className="popular-document-subject">
                    {doc.subject === "math"
                      ? "Toán học"
                      : doc.subject === "physics"
                        ? "Vật lý"
                        : doc.subject === "chemistry"
                          ? "Hóa học"
                          : doc.subject === "biology"
                            ? "Sinh học"
                            : doc.subject === "literature"
                              ? "Ngữ văn"
                              : doc.subject === "english"
                                ? "Tiếng Anh"
                                : doc.subject === "history"
                                  ? "Lịch sử"
                                  : doc.subject === "geography"
                                    ? "Địa lý"
                                    : doc.subject}
                  </p>
                  <div className="popular-document-meta">
                    <span>
                      <i className="fas fa-eye"></i> {doc.views || 0}
                    </span>
                    <span>
                      <i className="fas fa-download"></i> {doc.downloads || 0}
                    </span>
                    <span>
                      <i className="fas fa-star"></i> {doc.rating ? doc.rating.toFixed(1) : "N/A"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="documents-grid">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <Link to={`/documents/${doc._id}`} key={doc._id} className="document-card">
              <div className="document-thumbnail">
                <img src={doc.thumbnail || "/placeholder.svg?height=150&width=250"} alt={doc.title} loading="lazy" />
              </div>
              <div className="document-content">
                <h3>{doc.title}</h3>
                <p className="document-description">
                  {doc.description
                    ? doc.description.length > 100
                      ? doc.description.substring(0, 100) + "..."
                      : doc.description
                    : "Không có mô tả"}
                </p>
                <div className="document-meta">
                  <span className="document-subject">
                    {doc.subject === "math"
                      ? "Toán học"
                      : doc.subject === "physics"
                        ? "Vật lý"
                        : doc.subject === "chemistry"
                          ? "Hóa học"
                          : doc.subject === "biology"
                            ? "Sinh học"
                            : doc.subject === "literature"
                              ? "Ngữ văn"
                              : doc.subject === "english"
                                ? "Tiếng Anh"
                                : doc.subject === "history"
                                  ? "Lịch sử"
                                  : doc.subject === "geography"
                                    ? "Địa lý"
                                    : doc.subject}
                  </span>
                  <span className="document-level">
                    {doc.educationLevel === "primary"
                      ? "Tiểu học"
                      : doc.educationLevel === "secondary"
                        ? "THCS"
                        : doc.educationLevel === "highschool"
                          ? "THPT"
                          : doc.educationLevel === "university"
                            ? "Đại học"
                            : doc.educationLevel}
                  </span>
                </div>
                <div className="document-stats">
                  <span>
                    <i className="fas fa-eye"></i> {doc.views || 0}
                  </span>
                  <span>
                    <i className="fas fa-download"></i> {doc.downloads || 0}
                  </span>
                  <span>
                    <i className="fas fa-star"></i> {doc.rating ? doc.rating.toFixed(1) : "N/A"}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-documents">
            <i className="fas fa-file-alt"></i>
            <p>Không tìm thấy tài liệu nào phù hợp với bộ lọc.</p>
            <button onClick={() => setFilters({ educationLevel: "all", subject: "all", sort: "newest" })}>
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {loading && currentPage > 1 && (
        <div className="loading-more">
          <Spinner />
          <p>Đang tải thêm tài liệu...</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="pagination-button"
          >
            <i className="fas fa-chevron-left"></i> Trước
          </button>
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Hiển thị trang ��ầu, trang cuối và các trang xung quanh trang hiện tại
                return page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)
              })
              .map((page, index, array) => {
                // Thêm dấu "..." nếu có khoảng cách giữa các trang
                if (index > 0 && array[index - 1] !== page - 1) {
                  return (
                    <span key={`ellipsis-${page}`} className="pagination-ellipsis">
                      ...
                    </span>
                  )
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-page ${currentPage === page ? "active" : ""}`}
                    disabled={loading}
                  >
                    {page}
                  </button>
                )
              })}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="pagination-button"
          >
            Sau <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      <div className="document-create-button">
        <Link to="/documents/create" className="create-button">
          <i className="fas fa-plus"></i> Tạo tài liệu mới
        </Link>
      </div>
    </div>
  )
}

export default DocumentList
