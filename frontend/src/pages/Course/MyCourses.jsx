import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import { getAllCourses } from "../../services/courseService"; // Sửa từ getCourses thành getAllCourses
import "./MyCourses.css";

const MyCourses = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !token) {
      toast.error("Vui lòng đăng nhập để xem khóa học của bạn!");
      navigate("/auth/login");
      return;
    }

    const loadCourses = async () => {
      setLoading(true);
      try {
        const params = user.role === "student" ? { enrolled: true } : { instructorId: user._id };
        const response = await getAllCourses(params); // Sửa từ getCourses thành getAllCourses
        setCourses(response.data);
      } catch (err) {
        setError("Không thể tải danh sách khóa học!");
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [user, token, navigate]);

  const handleImageError = (e) => {
    e.target.src = "/assets/images/default-course.jpg";
  };

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

      <motion.section
        className="courses-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2>Khóa học của tôi</h2>
        {loading ? (
          <p className="loading">Đang tải...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : courses.length > 0 ? (
          <div className="courses-list">
            {courses.map((course) => (
              <motion.div
                key={course._id}
                className="course-item"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={course.thumbnail || "/assets/images/default-course.jpg"}
                  alt={course.title}
                  className="course-image"
                  onError={handleImageError}
                />
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <p className="course-price">Giá: {course.price.toLocaleString()} VND</p>
                  <div className="course-actions">
                    <Link to={`/courses/${course._id}`} className="course-link">
                      Xem khóa học
                    </Link>
                    {(user.role === "teacher" || user.role === "admin") && (
                      <Link to={`/courses/edit/${course._id}`} className="edit-link">
                        Chỉnh sửa
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="no-results">Bạn chưa có khóa học nào.</p>
        )}
      </motion.section>
    </div>
  );
};

export default MyCourses;