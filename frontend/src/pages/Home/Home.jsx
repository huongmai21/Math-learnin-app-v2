"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import { getNewsPress } from "../../services/newsService";
import { getCoursesPress } from "../../services/courseService";
import api from "../../services/api";
import "./HomePage.css";

const HomePage = () => {
  const [news, setNews] = useState([]);
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Chào mừng đến với FunMath",
      description: "Học Toán dễ dàng và thú vị hơn bao giờ hết!",
      buttonText: user ? "Bắt đầu học ngay" : "Đăng nhập để học ngay",
      onClick: () => navigate(user ? "/courses" : "/auth/login"),
      image:
        "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934624/1_bsngjz.png",
    },
    {
      title: "Khám phá khóa học mới",
      description: "Hàng loạt khóa học Toán học thú vị đang chờ bạn!",
      buttonText: "Xem khóa học",
      onClick: () => navigate("/courses"),
      image:
        "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png",
    },
    {
      title: "Tham gia thi đấu",
      description: "Thử thách bản thân với các cuộc thi Toán học!",
      buttonText: "Thi đấu ngay",
      onClick: () => navigate("/exams"),
      image:
        "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934942/4_fpzzq2.png",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("examNotification", (data) => {
      toast.info(data.message, { position: "top-right", autoClose: 3000 });
    });
    socket.on("messageNotification", (data) => {
      toast.info(data.message, { position: "top-right", autoClose: 3000 });
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/auth/me")
        .then((response) => setUser(response.data))
        .catch((err) => {
          console.error(err);
          localStorage.removeItem("token");
        });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadData = async () => {
      setLoading(true);
      try {
        const [newsData, coursesData] = await Promise.all([
          getNewsPress({ limit: 3, signal: controller.signal }),
          getCoursesPress({ limit: 3, signal: controller.signal }),
        ]);

        if (!newsData.success) {
          throw new Error("Dữ liệu tin tức không hợp lệ");
        }
        setNews(newsData.news || []);

        if (!coursesData.success) {
          throw new Error("Dữ liệu khóa học không hợp lệ");
        }
        setCourses(coursesData.data || []);
      } catch (err) {
        console.error("Error loading data:", err);
        if (
          err.message !== "Không có tin tức nổi bật" &&
          err.message !== "Không có khóa học nổi bật"
        ) {
          setError("Không thể tải dữ liệu. Vui lòng thử lại sau!");
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
    return () => controller.abort();
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleImageError = (e) => {
    e.target.src =
      "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png";
  };

  return (
    <div className="homepage">
      <Helmet>
        <title>FunMath - Học Toán Dễ Dàng và Thú Vị</title>
        <meta
          name="description"
          content="FunMath cung cấp tài liệu học tập, khóa học, tin tức giáo dục, và các hoạt động thi đấu Toán học cho học sinh, sinh viên và giáo viên."
        />
        <meta
          name="keywords"
          content="học toán, tài liệu toán, khóa học toán, tin tức giáo dục, thi đấu toán học"
        />
        <meta name="author" content="FunMath Team" />
      </Helmet>

      <SearchBar />

      <motion.section
        className="banner"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="banner-slides">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`banner-slide ${
                index === currentSlide ? "active" : ""
              }`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${slide.image})`,
              }}
            >
              <div className="banner-content">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={
                    index === currentSlide
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: -20 }
                  }
                  transition={{ duration: 0.5 }}
                >
                  {slide.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    index === currentSlide
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {slide.description}
                </motion.p>
                <motion.button
                  className="cta-button"
                  onClick={slide.onClick}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={
                    index === currentSlide
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.9 }
                  }
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {slide.buttonText}
                </motion.button>
              </div>
            </div>
          ))}
        </div>
        <button className="banner-nav prev" onClick={handlePrevSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="banner-nav next" onClick={handleNextSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>
        <div className="banner-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            ></button>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="stats-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="stats-container">
          <div className="stat-item">
            <i className="fas fa-users"></i>
            <div>
              <h3>5,000+</h3>
              <p>Học viên</p>
            </div>
          </div>
          <div className="stat-item">
            <i className="fas fa-book"></i>
            <div>
              <h3>200+</h3>
              <p>Tài liệu</p>
            </div>
          </div>
          <div className="stat-item">
            <i className="fas fa-graduation-cap"></i>
            <div>
              <h3>50+</h3>
              <p>Khóa học</p>
            </div>
          </div>
          <div className="stat-item">
            <i className="fas fa-trophy"></i>
            <div>
              <h3>100+</h3>
              <p>Bài thi</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="news-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2>Tin tức nổi bật</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : news.length > 0 ? (
          <div className="news-list">
            {news.map((item) => (
              <motion.div
                key={item._id || item.id}
                className="news-item"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              >
                <img
                  src={
                    item.image ||
                    "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934626/3_q1etwh.png"
                  }
                  alt={item.title}
                  className="news-image"
                  onError={handleImageError}
                />
                <div className="news-content">
                  <h3>{item.title}</h3>
                  <div className="news-meta">
                    <span>
                      <i className="fas fa-user"></i>{" "}
                      {item.author?.username || "Tác giả"}
                    </span>
                    <span>
                      <i className="fas fa-calendar"></i>{" "}
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                    <span>
                      <i className="fas fa-eye"></i> {item.views || 0} lượt xem
                    </span>
                  </div>
                  <p>{item.summary || item.content?.slice(0, 150) + "..."}</p>
                  <Link
                    to={`/news/${item._id || item.id}`}
                    className="read-more"
                  >
                    Đọc thêm
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p>Không có tin tức nào.</p>
        )}
        <Link to="/news" className="view-more">
          Xem tất cả tin tức
        </Link>
      </motion.section>

      <motion.section
        className="resources-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2>Tài liệu học tập</h2>
        <div className="resources-list">
          {[
            { to: "/documents/grade1", label: "Cấp 1", icon: "fa-child" },
            { to: "/documents/grade2", label: "Cấp 2", icon: "fa-user" },
            {
              to: "/documents/grade3",
              label: "Cấp 3",
              icon: "fa-user-graduate",
            },
            {
              to: "/documents/university",
              label: "Đại học",
              icon: "fa-university",
            },
          ].map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link to={item.to} className="resource-item">
                <i className={`fas ${item.icon}`}></i>
                <span>{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="courses-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2>Khóa học nổi bật</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : courses.length > 0 ? (
          <div className="courses-list">
            {courses.map((course) => (
              <motion.div
                key={course._id || course.id}
                className="course-item"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              >
                <img
                  src={
                    course.image ||
                    "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png"
                  }
                  alt={course.title}
                  className="course-image"
                  onError={handleImageError}
                />
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span className="course-author">
                      <i className="fas fa-user"></i>{" "}
                      {course.instructorId?.username || "Giảng viên"}
                    </span>
                    <span className="course-price">
                      {course.price === 0
                        ? "Miễn phí"
                        : `${course.price.toLocaleString()} VND`}
                    </span>
                    <span className="course-enrollment">
                      <i className="fas fa-users"></i>{" "}
                      {course.enrollmentCount || 0} học viên
                    </span>
                  </div>
                  <Link
                    to={`/courses/${course._id || course.id}`}
                    className="course-link"
                  >
                    Xem khóa học
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p>Không có khóa học nào.</p>
        )}
        <Link to="/courses" className="view-more">
          Xem tất cả khóa học
        </Link>
      </motion.section>

      <motion.section
        className="activities-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2>Thi đấu và học tập</h2>
        <div className="activities-list">
          <motion.div
            className="activity-item"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
          >
            <div className="activity-icon">
              <i className="fas fa-medal"></i>
            </div>
            <h3>Tham gia thi đấu</h3>
            <p>Kiểm tra kiến thức của bạn với các đề thi thú vị!</p>
            <Link to="/exam" className="activity-button">
              Thi đấu ngay
            </Link>
          </motion.div>
          {user ? (
            <>
              <motion.div
                className="activity-item"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              >
                <div className="activity-icon">
                  <i className="fas fa-comments"></i>
                </div>
                <h3>Góc học tập</h3>
                <p>Hỏi bài và giải bài tập cùng cộng đồng.</p>
                <Link to="/study-corner" className="activity-button">
                  Truy cập ngay
                </Link>
              </motion.div>
              <motion.div
                className="activity-item"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              >
                <div className="activity-icon">
                  <i className="fas fa-users"></i>
                </div>
                <h3>Phòng học nhóm</h3>
                <p>Cùng học và trao đổi với bạn bè.</p>
                <Link to="/study-room" className="activity-button">
                  Tạo phòng ngay
                </Link>
              </motion.div>
            </>
          ) : (
            <motion.div
              className="activity-item"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            >
              <div className="activity-icon">
                <i className="fas fa-user-plus"></i>
              </div>
              <h3>Tham gia cộng đồng</h3>
              <p>Đăng nhập để truy cập các góc học tập và phòng học nhóm.</p>
              <button
                onClick={() => navigate("/auth/login")}
                className="activity-button"
              >
                Đăng nhập ngay
              </button>
            </motion.div>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
