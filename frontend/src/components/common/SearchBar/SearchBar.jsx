"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import searchService from "../../../services/searchService"
import "./SearchBar.css"
import { FaSearch } from "react-icons/fa"

const SearchBar = ({ placeholder = "Tìm kiếm...", onSearch, className = "", type = null }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
        setFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 2) {
        setLoading(true)
        try {
          const results = type
            ? await searchService.searchByType(searchTerm, type)
            : await searchService.searchResources(searchTerm)
          setSearchResults(results.data?.documents || results.data || [])
          setShowResults(true)
        } catch (error) {
          console.error("Error searching:", error)
          setSearchResults([])
        } finally {
          setLoading(false)
        }
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, type])

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      if (onSearch) {
        onSearch(searchTerm)
        setShowResults(false)
      } else {
        navigate(`/search?q=${encodeURIComponent(searchTerm)}${type ? `&type=${type}` : ''}`)
      }
      setShowResults(false)
    }
  }

  const handleResultClick = (result) => {
    let url = ""
    switch (result.type || type) {
      case "course":
        url = `/courses/${result._id}`
        break
      case "document":
        url = `/documents/${result._id}`
        break
      case "news":
        url = `/news/${result._id}`
        break
      case "exam":
        url = `/exams/${result._id}`
        break
      case "user":
        url = `/users/${result._id}`
        break
      default:
        url = `/search?q=${encodeURIComponent(searchTerm)}`
    }
    navigate(url)
    setShowResults(false)
    setSearchTerm("")
  }

  const getResultIcon = (resultType) => {
    switch (resultType) {
      case "course":
        return "fa-graduation-cap"
      case "document":
        return "fa-file-alt"
      case "news":
        return "fa-newspaper"
      case "exam":
        return "fa-clipboard-list"
      case "user":
        return "fa-user"
      default:
        return "fa-search"
    }
  }

  const getResultLabel = (resultType) => {
    switch (resultType) {
      case "course":
        return "Khóa học"
      case "document":
        return "Tài liệu"
      case "news":
        return "Tin tức"
      case "exam":
        return "Đề thi"
      case "user":
        return "Người dùng"
      default:
        return resultType
    }
  }

  return (
    <div className={`search-container ${className} ${focused ? "focused" : ""}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            setFocused(true)
            if (searchTerm.trim().length > 2) setShowResults(true)
          }}
          aria-label="Tìm kiếm"
        />
        <button type="submit" className="search-button" aria-label="Tìm kiếm">
          <FaSearch />
        </button>
      </form>

      {showResults && (
        <div className="search-results">
          {loading ? (
            <div className="search-loading">
              <div className="spinner"></div>
              <span>Đang tìm kiếm...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              {searchResults.map((result) => (
                <div
                  key={`${result.type || type}-${result._id}`}
                  className="search-result-item"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="result-icon">
                    <i className={`fas ${getResultIcon(result.type || type)}`}></i>
                  </div>
                  <div className="result-content">
                    <div className="result-title">{result.title}</div>
                    {result.description && (
                      <div className="result-description">
                        {result.description.length > 100
                          ? `${result.description.substring(0, 100)}...`
                          : result.description}
                      </div>
                    )}
                    <div className="result-type">{getResultLabel(result.type || type)}</div>
                  </div>
                </div>
              ))}
              <div className="search-all">
                <button onClick={() => navigate(`/search?q=${encodeURIComponent(searchTerm)}${type ? `&type=${type}` : ''}`)}>
                  Xem tất cả kết quả
                </button>
              </div>
            </>
          ) : (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <span>Không tìm thấy kết quả</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar