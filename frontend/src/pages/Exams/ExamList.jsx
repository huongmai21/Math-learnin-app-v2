"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import "./Exam.css"

const ExamList = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [exams, setExams] = useState([])
  const [recommendedExams, setRecommendedExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    educationLevel: "",
    subject: "",
    difficulty: "",
    status: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true)
        setError(null)

        // Giả lập dữ liệu khi backend chưa hoạt động
        setTimeout(() => {
          const mockExams = [
            {
              _id: "1",
              title: "Đề thi Đại số lớp 10",
              description: "Đề thi học kỳ 1 môn Đại số dành cho học sinh lớp 10",
              educationLevel: "grade10",
              subject: "algebra",
              difficulty: "medium",
              duration: 60,
              questions: Array(15).fill({}),
              startTime: new Date(Date.now() + 86400000).toISOString(),
              endTime: new Date(Date.now() + 172800000).toISOString(),
              status: "upcoming",
            },
            {
              _id: "2",
              title: "Đề thi Hình học lớp 9",
              description: "Đề thi cuối kỳ môn Hình học dành cho học sinh lớp 9",
              educationLevel: "grade9",
              subject: "geometry",
              difficulty: "hard",
              duration: 45,
              questions: Array(10).fill({}),
              startTime: new Date(Date.now() - 86400000).toISOString(),
              endTime: new Date(Date.now() + 86400000).toISOString(),
              status: "ongoing",
            },
            {
              _id: "3",
              title: "Đề thi Giải tích lớp 12",
              description: "Đề thi thử THPT Quốc gia môn Toán phần Giải tích",
              educationLevel: "grade12",
              subject: "calculus",
              difficulty: "hard",
              duration: 90,
              questions: Array(20).fill({}),
              startTime: new Date(Date.now() - 172800000).toISOString(),
              endTime: new Date(Date.now() - 86400000).toISOString(),
              status: "ended",
            },
            {
              _id: "4",
              title: "Đề thi Thống kê lớp 11",
              description: "Đề thi giữa kỳ phần Thống kê và Xác suất",
              educationLevel: "grade11",
              subject: "statistics",
              difficulty: "easy",
              duration: 45,
              questions: Array(12).fill({}),
              startTime: new Date(Date.now() + 259200000).toISOString(),
              endTime: new Date(Date.now() + 345600000).toISOString(),
              status: "upcoming",
            },
          ]

          setExams(mockExams)
          setRecommendedExams(mockExams.slice(0, 2))
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đề thi:", error)
        setError("Không thể tải danh sách đề thi. Vui lòng thử lại sau.")
        setExams([])
        setLoading(false)
      }
    }

    fetchExams()
  }, [isAuthenticated, user, filters, searchQuery])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const resetFilters = () => {
    setFilters({
      educationLevel: "",
      subject: "",
      difficulty: "",
      status: "",
    })
    setSearchQuery("")
  }

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesEducationLevel = filters.educationLevel ? exam.educationLevel === filters.educationLevel : true
    const matchesSubject = filters.subject ? exam.subject === filters.subject : true
    const matchesDifficulty = filters.difficulty ? exam.difficulty === filters.difficulty : true
    const matchesStatus = filters.status ? exam.status === filters.status : true

    return matchesSearch && matchesEducationLevel && matchesSubject && matchesDifficulty && matchesStatus
  })

  if (loading) {
    return (
      <div className="exam-list-container">
        <div className="exam-header">
          <h1>Thi đấu</h1>
          <p>Tham gia các kỳ thi, thử thách và nâng cao kỹ năng toán học của bạn</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải danh sách đề thi...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="exam-list-container">
        <div className="exam-header">
          <h1>Thi đấu</h1>
          <p>Tham gia các kỳ thi, thử thách và nâng cao kỹ năng toán học của bạn</p>
        </div>
        <div className="error-message">
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
    <div className="exam-list-container">
      <motion.div
        className="exam-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Thi đấu</h1>
        <p>Tham gia các kỳ thi, thử thách và nâng cao kỹ năng toán học của bạn</p>
      </motion.div>

      <motion.div
        className="search-filter-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm đề thi..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div className="filters">
          <select
            name="educationLevel"
            value={filters.educationLevel}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Tất cả cấp học</option>
            {[...Array(12).keys()].map((i) => (
              <option key={i + 1} value={`grade${i + 1}`}>
                Lớp {i + 1}
              </option>
            ))}
            <option value="university">Đại học</option>
          </select>

          <select name="subject" value={filters.subject} onChange={handleFilterChange} className="filter-select">
            <option value="">Tất cả môn</option>
            <option value="algebra">Đại số</option>
            <option value="geometry">Hình học</option>
            <option value="calculus">Giải tích</option>
            <option value="statistics">Thống kê</option>
          </select>

          <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} className="filter-select">
            <option value="">Tất cả độ khó</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>

          <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
            <option value="">Tất cả trạng thái</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="ongoing">Đang diễn ra</option>
            <option value="ended">Kết thúc</option>
          </select>

          <button className="reset-button" onClick={resetFilters}>
            <i className="fas fa-times"></i> Xóa bộ lọc
          </button>
        </div>
      </motion.div>

      {isAuthenticated && recommendedExams.length > 0 && (
        <motion.div
          className="recommended-exams"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2>Đề xuất cho bạn</h2>
          <div className="exam-grid">
            {recommendedExams.map((exam, index) => (
              <motion.div
                key={exam._id}
                className={`exam-card ${exam.status}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <div className="exam-card-header">
                  <span className={`difficulty-badge ${exam.difficulty}`}>
                    {exam.difficulty === "easy" ? "Dễ" : exam.difficulty === "medium" ? "Trung bình" : "Khó"}
                  </span>
                  <h3>{exam.title}</h3>
                </div>
                <div className="exam-card-body">
                  <p>{exam.description}</p>
                  <div className="exam-info">
                    <span>
                      <i className="fas fa-graduation-cap"></i>{" "}
                      {exam.educationLevel.includes("grade")
                        ? `Lớp ${exam.educationLevel.replace("grade", "")}`
                        : "Đại học"}
                    </span>
                    <span>
                      <i className="fas fa-book"></i>{" "}
                      {exam.subject === "algebra"
                        ? "Đại số"
                        : exam.subject === "geometry"
                          ? "Hình học"
                          : exam.subject === "calculus"
                            ? "Giải tích"
                            : "Thống kê"}
                    </span>
                    <span>
                      <i className="fas fa-clock"></i> {exam.duration} phút
                    </span>
                    <span>
                      <i className="fas fa-question-circle"></i> {exam.questions?.length || 0} câu hỏi
                    </span>
                  </div>
                </div>
                <div className="exam-card-footer">
                  <Link to={`/exams/${exam._id}`} className="take-exam-button">
                    <i className="fas fa-pencil-alt"></i> Làm bài
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        className="all-exams"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2>Tất cả đề thi</h2>
        {filteredExams.length > 0 ? (
          <div className="exam-grid">
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam._id}
                className={`exam-card ${exam.status}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <div className="exam-card-header">
                  <span className={`difficulty-badge ${exam.difficulty}`}>
                    {exam.difficulty === "easy" ? "Dễ" : exam.difficulty === "medium" ? "Trung bình" : "Khó"}
                  </span>
                  <h3>{exam.title}</h3>
                </div>
                <div className="exam-card-body">
                  <p>{exam.description}</p>
                  <div className="exam-info">
                    <span>
                      <i className="fas fa-graduation-cap"></i>{" "}
                      {exam.educationLevel.includes("grade")
                        ? `Lớp ${exam.educationLevel.replace("grade", "")}`
                        : "Đại học"}
                    </span>
                    <span>
                      <i className="fas fa-book"></i>{" "}
                      {exam.subject === "algebra"
                        ? "Đại số"
                        : exam.subject === "geometry"
                          ? "Hình học"
                          : exam.subject === "calculus"
                            ? "Giải tích"
                            : "Thống kê"}
                    </span>
                    <span>
                      <i className="fas fa-clock"></i> {exam.duration} phút
                    </span>
                    <span>
                      <i className="fas fa-question-circle"></i> {exam.questions?.length || 0} câu hỏi
                    </span>
                  </div>
                  <div className="exam-status-info">
                    <span className={`status-indicator ${exam.status}`}>
                      {exam.status === "upcoming" ? (
                        <>
                          <i className="fas fa-hourglass-start"></i> Sắp diễn ra
                        </>
                      ) : exam.status === "ongoing" ? (
                        <>
                          <i className="fas fa-play-circle"></i> Đang diễn ra
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle"></i> Đã kết thúc
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="exam-card-footer">
                  <Link to={`/exams/${exam._id}`} className="take-exam-button">
                    {exam.status === "upcoming" ? (
                      <>
                        <i className="fas fa-bell"></i> Nhắc nhở
                      </>
                    ) : exam.status === "ongoing" ? (
                      <>
                        <i className="fas fa-pencil-alt"></i> Làm bài
                      </>
                    ) : (
                      <>
                        <i className="fas fa-eye"></i> Xem kết quả
                      </>
                    )}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="no-exams">
            <i className="fas fa-search"></i>
            <p>Không có bài thi nào phù hợp với bộ lọc của bạn.</p>
            <button onClick={resetFilters} className="reset-filters-button">
              <i className="fas fa-sync"></i> Xóa bộ lọc
            </button>
          </div>
        )}
      </motion.div>

      {user?.role === "teacher" && (
        <motion.div
          className="create-exam-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link to="/exams/create" className="create-exam-button">
            <i className="fas fa-plus"></i> Tạo đề thi mới
          </Link>
        </motion.div>
      )}
    </div>
  )
}

export default ExamList
