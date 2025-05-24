"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { searchResources } from "../../services/searchService"
import { Link } from "react-router-dom"
import Spinner from "../../components/ui/Spinner"
import "./SearchResults.css"

const SearchResults = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState({
    documents: [],
    courses: [],
    users: [],
    posts: [],
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const data = await searchResources.search(query)
        setResults(data)
      } catch (error) {
        console.error("Error fetching search results:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query])

  const renderDocuments = () => {
    if (results.documents.length === 0) return <p>Không tìm thấy tài liệu nào.</p>

    return (
      <div className="search-results-grid">
        {results.documents.map((doc) => (
          <div key={doc._id} className="search-result-card">
            <h3>
              <Link to={`/documents/${doc._id}`}>{doc.title}</Link>
            </h3>
            <p className="search-result-description">{doc.description.substring(0, 100)}...</p>
            <div className="search-result-meta">
              <span>Cấp độ: {doc.educationLevel}</span>
              <span>Môn học: {doc.subject}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderCourses = () => {
    if (results.courses.length === 0) return <p>Không tìm thấy khóa học nào.</p>

    return (
      <div className="search-results-grid">
        {results.courses.map((course) => (
          <div key={course._id} className="search-result-card">
            <h3>
              <Link to={`/courses/${course._id}`}>{course.title}</Link>
            </h3>
            <p className="search-result-description">{course.description.substring(0, 100)}...</p>
            <div className="search-result-meta">
              <span>Giá: {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()} VND`}</span>
              <span>Cấp độ: {course.level}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderUsers = () => {
    if (results.users.length === 0) return <p>Không tìm thấy người dùng nào.</p>

    return (
      <div className="search-results-grid">
        {results.users.map((user) => (
          <div key={user._id} className="search-result-card user-card">
            <div className="user-avatar">
              <img src={user.avatar || "/placeholder.svg?height=50&width=50"} alt={user.name} />
            </div>
            <div className="user-info">
              <h3>
                <Link to={`/users/${user._id}`}>{user.name}</Link>
              </h3>
              <p>{user.bio || "Không có thông tin"}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderPosts = () => {
    if (results.posts.length === 0) return <p>Không tìm thấy bài viết nào.</p>

    return (
      <div className="search-results-grid">
        {results.posts.map((post) => (
          <div key={post._id} className="search-result-card">
            <h3>
              <Link to={`/study-corner/post/${post._id}`}>{post.title}</Link>
            </h3>
            <p className="search-result-description">{post.content.substring(0, 100)}...</p>
            <div className="search-result-meta">
              <span>Tác giả: {post.author.name}</span>
              <span>Ngày đăng: {new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderAllResults = () => {
    return (
      <>
        {results.documents.length > 0 && (
          <div className="search-section">
            <h2>Tài liệu</h2>
            {renderDocuments()}
            {results.documents.length > 3 && (
              <div className="view-more">
                <button onClick={() => setActiveTab("documents")}>Xem thêm tài liệu</button>
              </div>
            )}
          </div>
        )}

        {results.courses.length > 0 && (
          <div className="search-section">
            <h2>Khóa học</h2>
            {renderCourses()}
            {results.courses.length > 3 && (
              <div className="view-more">
                <button onClick={() => setActiveTab("courses")}>Xem thêm khóa học</button>
              </div>
            )}
          </div>
        )}

        {results.users.length > 0 && (
          <div className="search-section">
            <h2>Người dùng</h2>
            {renderUsers()}
            {results.users.length > 3 && (
              <div className="view-more">
                <button onClick={() => setActiveTab("users")}>Xem thêm người dùng</button>
              </div>
            )}
          </div>
        )}

        {results.posts.length > 0 && (
          <div className="search-section">
            <h2>Bài viết</h2>
            {renderPosts()}
            {results.posts.length > 3 && (
              <div className="view-more">
                <button onClick={() => setActiveTab("posts")}>Xem thêm bài viết</button>
              </div>
            )}
          </div>
        )}

        {Object.values(results).every((arr) => arr.length === 0) && (
          <div className="no-results">
            <h2>Không tìm thấy kết quả nào cho "{query}"</h2>
            <p>Vui lòng thử lại với từ khóa khác hoặc kiểm tra chính tả.</p>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="search-results-container">
      <div className="search-header">
        <h1>Kết quả tìm kiếm cho: "{query}"</h1>
      </div>

      {loading ? (
        <div className="search-loading">
          <Spinner />
          <p>Đang tìm ki��m...</p>
        </div>
      ) : (
        <>
          <div className="search-tabs">
            <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>
              Tất cả
            </button>
            <button className={activeTab === "documents" ? "active" : ""} onClick={() => setActiveTab("documents")}>
              Tài liệu ({results.documents.length})
            </button>
            <button className={activeTab === "courses" ? "active" : ""} onClick={() => setActiveTab("courses")}>
              Khóa học ({results.courses.length})
            </button>
            <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
              Người dùng ({results.users.length})
            </button>
            <button className={activeTab === "posts" ? "active" : ""} onClick={() => setActiveTab("posts")}>
              Bài viết ({results.posts.length})
            </button>
          </div>

          <div className="search-results">
            {activeTab === "all" && renderAllResults()}
            {activeTab === "documents" && (
              <div className="search-section">
                <h2>Tài liệu</h2>
                {renderDocuments()}
              </div>
            )}
            {activeTab === "courses" && (
              <div className="search-section">
                <h2>Khóa học</h2>
                {renderCourses()}
              </div>
            )}
            {activeTab === "users" && (
              <div className="search-section">
                <h2>Người dùng</h2>
                {renderUsers()}
              </div>
            )}
            {activeTab === "posts" && (
              <div className="search-section">
                <h2>Bài viết</h2>
                {renderPosts()}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default SearchResults
