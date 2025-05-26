import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import { getMyCourses } from "../../services/courseService";
import "./MyCourses.css";

const MyCourses = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); 
  const limit = 6;

  useEffect(() => {
    if (!user || !token) {
      toast.error("Vui lòng đăng nhập để xem khóa học của bạn!");
      navigate("/auth/login");
      return;
    }

    const loadCourses = async () => {
      setLoading(true);
      try {
        const params =
          user.role === "student"
            ? { enrolled: true, page, limit }
            : { instructorId: user._id, page, limit };
        const response = await getMyCourses();
        setCourses(response.data);
        setTotalPages(response.totalPages || 1); // Đảm bảo totalPages có giá trị mặc định
      } catch (err) {
        setError("Không thể tải danh sách khóa học!");
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [user, token, navigate, page]); // Thêm page vào dependencies để cập nhật khi page thay đổi

  const handleImageError = (e) => {
    e.target.src =
      "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png";
  };

  const ProgressBar = ({ percentage }) => (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
    </div>
  );

  const sectionVariants = {
    Goosebumps: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="my-courses">
      <Helmet>
        <title>FunMath - Khóa học của tôi</title>
        <meta
          name="description"
          content="Xem danh sách các khóa học bạn đã đăng ký hoặc tạo."
        />
      </Helmet>

      <div className="courses-section">
        <div className="section-header">
          <h2>Khóa học của tôi</h2>
          {user.role === "teacher" && (
            <Link to="/courses/create" className="create-course-button">
              Tạo khóa học mới
            </Link>
          )}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
          >
            <option value="all">Tất cả</option>
            <option value="grade1">Toán cấp 1</option>
            <option value="grade2">Toán cấp 2</option>
            <option value="grade3">Toán cấp 3</option>
            <option value="university">Toán đại học</option>
          </select>
        </div>
        {loading ? (
          <p className="loading">Đang tải...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : courses.length > 0 ? (
          <div className="courses-list">
            {courses
              .filter(
                (course) =>
                  categoryFilter === "all" || course.category === categoryFilter
              )
              .map((course) => {
                const progress =
                  user.role === "student" && course.progress
                    ? course.progress.find((p) => p.userId === user._id) || {
                        completedContents: [],
                      }
                    : { completedContents: [] };
                const completionPercentage =
                  progress && course.contents?.length > 0
                    ? Math.round(
                        (progress.completedContents.length /
                          course.contents.length) *
                          100
                      )
                    : 0;

                return (
                  <motion.div
                    key={course._id}
                    className="course-item"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={
                        course.thumbnail ||
                        "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png"
                      }
                      alt={course.title}
                      className="course-image"
                      onError={handleImageError}
                    />
                    <div className="course-content">
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>
                      <p className="course-price">
                        Giá: {course.price.toLocaleString()} VND
                      </p>
                      <p>Số học viên: {course.enrollmentCount || 0}</p>
                      {user.role === "student" && (
                        <>
                          <p>Tiến độ: {completionPercentage}%</p>
                          <ProgressBar percentage={completionPercentage} />
                        </>
                      )}
                      <div className="course-actions">
                        <Link
                          to={`/courses/${course._id}`}
                          className="course-link"
                        >
                          Xem khóa học
                        </Link>
                        {(user.role === "teacher" || user.role === "admin") && (
                          <>
                            <Link
                              to={`/courses/edit/${course._id}`}
                              className="edit-link"
                            >
                              Chỉnh sửa
                            </Link>
                            <Link
                              to={`/courses/${course._id}/exams`}
                              className="exam-link"
                            >
                              Quản lý bài thi
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        ) : (
          <p className="no-results">Bạn chưa có khóa học nào.</p>
        )}

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
      </div>
    </div>
  );
};

export default MyCourses;