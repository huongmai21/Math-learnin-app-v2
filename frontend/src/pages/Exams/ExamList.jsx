"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { getAllExams, getRecommendedExams } from "../../services/examService";
import "./Exam.css";

const ExamList = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [exams, setExams] = useState([]);
  const [recommendedExams, setRecommendedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    educationLevel: "",
    subject: "",
    difficulty: "",
    status: "",
  });
  const [examHistory, setExamHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {
          ...filters,
          search: searchQuery,
          page,
          limit,
          isPublic: true,
        };
        const response = await getAllExams(params);
        setExams(response.data || []);
        setTotalPages(response.totalPages);
        if (isAuthenticated) {
          const recommended = await getRecommendedExams();
          setRecommendedExams(recommended.data || []);
        }
      } catch (error) {
        setError(error.message || "Không thể tải danh sách đề thi");
        setExams([]);
        setRecommendedExams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [isAuthenticated, user, filters, searchQuery, page]);

  // useEffect(() => {
  //   const fetchExamHistory = async () => {
  //     if (isAuthenticated) {
  //       try {
  //         const response = await getExamHistory(user._id); // Giả sử có API này
  //         setExamHistory(response.data || []);
  //       } catch (err) {
  //         toast.error("Không thể tải lịch sử bài thi!");
  //       }
  //     }
  //   };
  //   fetchExamHistory();
  // }, [isAuthenticated, user]);

  // const handleReminder = async (examId) => {
  //   try {
  //     await setExamReminder(examId); // Giả sử có API này
  //     toast.success("Đã đặt nhắc nhở cho bài thi!");
  //   } catch (err) {
  //     toast.error("Không thể đặt nhắc nhở!");
  //   }
  // };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      educationLevel: "",
      subject: "",
      difficulty: "",
      status: "",
    });
    setSearchQuery("");
    setPage(1);
  };

  const getStatus = (exam) => {
    const now = new Date();
    if (now < new Date(exam.startTime)) return "upcoming";
    if (now > new Date(exam.endTime)) return "ended";
    return "ongoing";
  };

  if (loading) {
    return (
      <div className="exam-list-container">
        <div className="exam-header">
          <h1>Thi đấu</h1>
          <p>
            Tham gia các kỳ thi, thử thách và nâng cao kỹ năng toán học của bạn
          </p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải danh sách đề thi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-list-container">
        <div className="exam-header">
          <h1>Thi đấu</h1>
          <p>
            Tham gia các kỳ thi, thử thách và nâng cao kỹ năng toán học của bạn
          </p>
        </div>
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
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
        <p>
          Tham gia các kỳ thi, thử thách và nâng cao kỹ năng toán học của bạn
        </p>
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

        <div className="exam-filters">
          <div className="filter-select">
            <select
              name="educationLevel"
              value={filters.educationLevel}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả cấp học</option>
              {[...Array(12).keys()].map((i) => (
                <option key={i + 1} value={`grade${i + 1}`}>
                  Lớp {i + 1}
                </option>
              ))}
              <option value="university">Đại học</option>
            </select>
          </div>

          <div className="filter-select">
            <select
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả môn</option>
              <option value="algebra">Đại số</option>
              <option value="geometry">Hình học</option>
              <option value="calculus">Giải tích</option>
              <option value="statistics">Thống kê</option>
            </select>
          </div>

          <div className="filter-select">
            <select
              name="difficulty"
              value={filters.difficulty}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả độ khó</option>
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </div>

          <div className="filter-select">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="ended">Kết thúc</option>
            </select>
          </div>

          <button className="reset-filters" onClick={resetFilters}>
            <i className="fas fa-times"></i> Xóa bộ lọc
          </button>
        </div>
      </motion.div>

      {isAuthenticated && examHistory.length > 0 && (
        <motion.div className="exam-history">
          <h2>Lịch sử bài thi</h2>
          <div className="exam-grid">
            {examHistory.map((exam, index) => (
              <motion.div
                key={exam._id}
                className="exam-card ended"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="exam-card-header">
                  <h3 className="exam-title">{exam.title}</h3>
                  <span className="exam-subject">{exam.subject}</span>
                </div>
                <div className="exam-card-body">
                  <p>
                    Điểm: {exam.score}/{exam.totalScore}
                  </p>
                  <p>
                    Nộp lúc:{" "}
                    {new Date(exam.submittedAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="exam-card-footer">
                  <Link to={`/exams/${exam._id}`} className="take-exam-button">
                    <i className="fas fa-eye"></i> Xem chi tiết
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      
      {isAuthenticated &&
        Array.isArray(recommendedExams) &&
        recommendedExams.length > 0 && (
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
                  className={`exam-card ${getStatus(exam)}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <div className="exam-card-header">
                    <span className={`difficulty-badge ${exam.difficulty}`}>
                      {exam.difficulty === "easy"
                        ? "Dễ"
                        : exam.difficulty === "medium"
                        ? "Trung bình"
                        : "Khó"}
                    </span>
                    <h3 className="exam-title">{exam.title}</h3>
                    <span className="exam-subject">
                      {exam.subject === "algebra"
                        ? "Đại số"
                        : exam.subject === "geometry"
                        ? "Hình học"
                        : exam.subject === "calculus"
                        ? "Giải tích"
                        : "Thống kê"}
                    </span>
                  </div>
                  <div className="exam-card-body">
                    <p className="exam-description">{exam.description}</p>
                    <div className="exam-info">
                      <div className="exam-info-item">
                        <i className="fas fa-graduation-cap"></i>
                        {exam.educationLevel.includes("grade")
                          ? `Lớp ${exam.educationLevel.replace("grade", "")}`
                          : "Đại học"}
                      </div>
                      <div className="exam-info-item">
                        <i className="fas fa-clock"></i> {exam.duration} phút
                      </div>
                      <div className="exam-info-item">
                        <i className="fas fa-question-circle"></i>{" "}
                        {exam.questions?.length || 0} câu hỏi
                      </div>
                    </div>
                    <div className="exam-status-info">
                      <span className={`status-indicator ${getStatus(exam)}`}>
                        {getStatus(exam) === "upcoming" ? (
                          <>
                            <i className="fas fa-hourglass-start"></i> Sắp diễn
                            ra
                          </>
                        ) : getStatus(exam) === "ongoing" ? (
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
                    <Link
                      to={`/exams/${exam._id}`}
                      className="take-exam-button"
                      onClick={(e) => {
                        if (getStatus(exam) === "upcoming") {
                          e.preventDefault();
                          handleReminder(exam._id);
                        }
                      }}
                    >
                      {getStatus(exam) === "upcoming" ? (
                        <>
                          <i className="fas fa-bell"></i> Nhắc nhở
                        </>
                      ) : getStatus(exam) === "ongoing" ? (
                        <>
                          <i className="fas fa-pencil-alt"></i> Làm bài
                        </>
                      ) : (
                        <>
                          <i className="fas fa-eye"></i> Xem kết quả
                        </>
                      )}
                    </Link>
                    <Link
                      to={`/exams/${exam._id}/leaderboard`}
                      className="leaderboard-button"
                    >
                      <i className="fas fa-trophy"></i> Bảng xếp hạng
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
        {exams.length > 0 ? (
          <>
            <div className="exam-grid">
              {exams.map((exam, index) => (
                <motion.div
                  key={exam._id}
                  className={`exam-card ${getStatus(exam)}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <div className="exam-card-header">
                    <span className={`difficulty-badge ${exam.difficulty}`}>
                      {exam.difficulty === "easy"
                        ? "Dễ"
                        : exam.difficulty === "medium"
                        ? "Trung bình"
                        : "Khó"}
                    </span>
                    <h3 className="exam-title">{exam.title}</h3>
                    <span className="exam-subject">
                      {exam.subject === "algebra"
                        ? "Đại số"
                        : exam.subject === "geometry"
                        ? "Hình học"
                        : exam.subject === "calculus"
                        ? "Giải tích"
                        : "Thống kê"}
                    </span>
                  </div>
                  <div className="exam-card-body">
                    <p className="exam-description">{exam.description}</p>
                    <div className="exam-info">
                      <div className="exam-info-item">
                        <i className="fas fa-graduation-cap"></i>
                        {exam.educationLevel.includes("grade")
                          ? `Lớp ${exam.educationLevel.replace("grade", "")}`
                          : "Đại học"}
                      </div>
                      <div className="exam-info-item">
                        <i className="fas fa-clock"></i> {exam.duration} phút
                      </div>
                      <div className="exam-info-item">
                        <i className="fas fa-question-circle"></i>{" "}
                        {exam.questions?.length || 0} câu hỏi
                      </div>
                    </div>
                    <div className="exam-status-info">
                      <span className={`status-indicator ${getStatus(exam)}`}>
                        {getStatus(exam) === "upcoming" ? (
                          <>
                            <i className="fas fa-hourglass-start"></i> Sắp diễn
                            ra
                          </>
                        ) : getStatus(exam) === "ongoing" ? (
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
                    <Link
                      to={`/exams/${exam._id}`}
                      className="take-exam-button"
                      onClick={(e) => {
                        if (getStatus(exam) === "upcoming") {
                          e.preventDefault();
                          handleReminder(exam._id);
                        }
                      }}
                    >
                      {getStatus(exam) === "upcoming" ? (
                        <>
                          <i className="fas fa-bell"></i> Nhắc nhở
                        </>
                      ) : getStatus(exam) === "ongoing" ? (
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
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={page === i + 1 ? "active" : ""}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
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
  );
};

export default ExamList;
