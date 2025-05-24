
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { useSelector } from "react-redux";
import { getAllCourses } from "../../services/courseService";
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
} from "../../services/bookmarkService";
import { getEnrolledCourses } from "../../services/userService";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import Spinner from "../../components/ui/Spinner";
import useToast from "../../utils/useToast";
import "./CoursePage.css";

const CoursePage = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const response = await getAllCourses({
          page,
          limit: 6,
          category: category === "all" ? undefined : category,
        });
        const coursesData = Array.isArray(response.data) ? response.data : [];
        setCourses(coursesData);
        setFilteredCourses(coursesData);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        if (err.message.includes("Network Error")) {
          setError("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.");
        } else if (err.response?.status === 401) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          navigate("/auth/login");
        } else {
          setError("Không thể tải danh sách khóa học!");
        }
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [page, category, navigate]);

  useEffect(() => {
    const loadBookmarksAndEnrollments = async () => {
      if (user && token) {
        try {
          const [bookmarkResponse, enrolledResponse] = await Promise.all([
            getBookmarks(),
            getEnrolledCourses(),
          ]);
          const bookmarkIds = Array.isArray(bookmarkResponse.data)
            ? bookmarkResponse.data.map((b) => b.courseId?._id).filter(Boolean)
            : [];
          const enrolledIds = Array.isArray(enrolledResponse.data)
            ? enrolledResponse.data.map((c) => c._id).filter(Boolean)
            : [];
          setBookmarks(bookmarkIds);
          setEnrolledCourses(enrolledIds);
        } catch (err) {
          setError("Không thể tải dữ liệu bookmark hoặc khóa học đã đăng ký!");
        }
      }
    };
    loadBookmarksAndEnrollments();
  }, [user, token]);

  const handleSearch = (query, results) => {
    const filtered = Array.isArray(results.data?.courses) ? results.data.courses : [];
    setFilteredCourses(filtered);
    setPage(1);
  };

  const handleBookmark = async (courseId) => {
    if (!user || !token) {
      showToast("error", "Vui lòng đăng nhập để bookmark khóa học!", {
        id: "bookmark-auth-error",
      });
      navigate("/auth/login");
      return;
    }
    try {
      if (bookmarks.includes(courseId)) {
        await removeBookmark(courseId);
        setBookmarks(bookmarks.filter((id) => id !== courseId));
        showToast("success", "Đã xóa bookmark!", { id: "bookmark-remove" });
      } else {
        await addBookmark(courseId);
        setBookmarks([...bookmarks, courseId]);
        showToast("success", "Đã bookmark khóa học!", { id: "bookmark-add" });
      }
    } catch (err) {
      showToast("error", err.message || "Lỗi khi bookmark khóa học!", {
        id: "bookmark-error",
      });
    }
  };

  const handleImageError = (e) => {
    e.target.src = "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png";
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="pagination-button"
        >
          Trang trước
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`pagination-button ${p === currentPage ? "active" : ""}`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="pagination-button"
        >
          Trang sau
        </button>
      </div>
    );
  };

  return (
    <div className="course-page">
      <Helmet>
        <title>FunMath - Khóa học</title>
        <meta
          name="description"
          content="Khám phá các khóa học Toán học từ cơ bản đến nâng cao dành cho mọi cấp độ."
        />
      </Helmet>

      <motion.section
        className="courses-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2>Các khóa học của chúng tôi</h2>
        <div className="filter-bar">
          <SearchBar onSearch={handleSearch} />
          <div className="filter-controls">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="category-filter"
              aria-label="Lọc theo danh mục"
            >
              <option value="all">Tất cả</option>
              <option value="grade1">Toán cấp 1</option>
              <option value="grade2">Toán cấp 2</option>
              <option value="grade3">Toán cấp 3</option>
              <option value="university">Toán đại học</option>
            </select>
            {category !== "all" && (
              <button
                onClick={() => setCategory("all")}
                className="reset-filter-btn"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError("")}>Thử lại</button>
          </div>
        )}
        {loading ? (
          <div className="course-loading">
            <Spinner />
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="course-grid">
            {filteredCourses.map((course) => (
              <motion.div
                key={course._id}
                className="course-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
              >
                <div className="course-image">
                  <img
                    src={course.thumbnail || "/assets/images/default-course.jpg"}
                    alt={course.title}
                    onError={handleImageError}
                    loading="lazy"
                  />
                </div>
                <div className="course-content">
                  <h3 className="course-title">
                    <Link to={`/courses/${course._id}`}>{course.title}</Link>
                  </h3>
                  <p className="course-description">{course.description}</p>
                  <div className="course-meta">
                    <p className="course-price">
                      Giá: {course.price.toLocaleString()} VND
                    </p>
                    {enrolledCourses.includes(course._id) && (
                      <p className="course-status">Đã đăng ký</p>
                    )}
                  </div>
                  <div className="course-actions">
                    <Link
                      to={`/courses/${course._id}`}
                      className="enroll-button"
                    >
                      {enrolledCourses.includes(course._id)
                        ? "Vào học"
                        : "Xem khóa học"}
                    </Link>
                    {user && (
                      <button
                        className={`bookmark-button ${
                          bookmarks.includes(course._id) ? "bookmarked" : ""
                        }`}
                        onClick={() => handleBookmark(course._id)}
                        aria-label={
                          bookmarks.includes(course._id)
                            ? "Xóa bookmark"
                            : "Bookmark khóa học"
                        }
                      >
                        <i
                          className={
                            bookmarks.includes(course._id)
                              ? "fas fa-bookmark"
                              : "far fa-bookmark"
                          }
                        ></i>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="no-results">
            Không tìm thấy khóa học nào.{" "}
            {user && user.role === "teacher" && (
              <Link to="/courses/create" className="create-course-link">
                Tạo khóa học mới
              </Link>
            )}
          </p>
        )}
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </motion.section>
    </div>
  );
};

export default React.memo(CoursePage);