"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import searchService from "../../../services/searchService"
import "./SearchBar.css"
import { FaSearch } from "react-icons/fa"

const SearchBar = ({ placeholder = "Tìm kiếm...", onSearch, className = "" }) => {
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
          const results = await searchService.searchResources(searchTerm)
          setSearchResults(results)
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
  }, [searchTerm])

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      if (onSearch) {
        onSearch(searchTerm)
      } else {
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`)
      }
      setShowResults(false)
    }
  }

  const handleResultClick = (result) => {
    let url = ""
    switch (result.type) {
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

  const getResultIcon = (type) => {
    switch (type) {
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

  const getResultLabel = (type) => {
    switch (type) {
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
        return type
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
                  key={`${result.type}-${result._id}`}
                  className="search-result-item"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="result-icon">
                    <i className={`fas ${getResultIcon(result.type)}`}></i>
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
                    <div className="result-type">{getResultLabel(result.type)}</div>
                  </div>
                </div>
              ))}
              <div className="search-all">
                <button onClick={() => navigate(`/search?q=${encodeURIComponent(searchTerm)}`)}>
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
