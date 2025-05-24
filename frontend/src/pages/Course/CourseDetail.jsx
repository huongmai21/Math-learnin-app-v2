"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import {
  getCourseById,
  enrollCourse,
  updateProgress,
  getCourseLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  createReview,
  getCourseReviews,
} from "../../services/courseService";
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
} from "../../services/bookmarkService";
import "./CourseDetail.css";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({ completedContents: [] });
  const [reviews, setReviews] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [newLesson, setNewLesson] = useState({
    title: "",
    type: "video",
    url: "",
    isPreview: false,
  });
  const [editingLesson, setEditingLesson] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getCourseById(id);
        setCourse(response.data);
        const lessonsRes = await getCourseLessons(id);
        setLessons(lessonsRes.data || []);
        if (user && token) {
          const reviewsRes = await getCourseReviews(id);
          setReviews(reviewsRes.data || []);
          const bookmarkRes = await getBookmarks();
          setBookmarks(bookmarkRes.data.map((b) => b.courseId._id));

          // Lấy tiến độ học tập ban đầu
          const userProgress = user.progress?.find((p) => p.courseId === id);
          setProgress(userProgress || { completedContents: [] });
        }
      } catch (err) {
        setError(err?.message || "Không thể tải chi tiết khóa học!");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, user, token]);

  const handleEnroll = async () => {
    if (!user || !token) {
      toast.error("Vui lòng đăng nhập để đăng ký khóa học!");
      navigate("/auth/login");
      return;
    }
    try {
      await enrollCourse(id);
      toast.success("Đăng ký khóa học thành công!");
      navigate(0);
    } catch (err) {
      toast.error(err?.message || "Đăng ký thất bại!");
    }
  };

  const handleBookmark = async () => {
    if (!user || !token) {
      toast.error("Vui lòng đăng nhập để bookmark khóa học!");
      navigate("/auth/login");
      return;
    }
    try {
      if (bookmarks.includes(id)) {
        await removeBookmark(id);
        setBookmarks(bookmarks.filter((bId) => bId !== id));
        toast.success("Đã xóa bookmark!");
      } else {
        await addBookmark(id);
        setBookmarks([...bookmarks, id]);
        toast.success("Đã bookmark khóa học!");
      }
    } catch (err) {
      toast.error(err?.message || "Lỗi khi bookmark khóa học!");
    }
  };

  // Đánh dấu hoàn thành bài học
  const handleCompleteLesson = async (lessonId) => {
    if (!user || !token) {
      toast.error("Vui lòng đăng nhập để cập nhật tiến độ!");
      return;
    }
    try {
      const isCompleted = progress.completedContents.includes(lessonId);
      const response = await updateProgress(id, lessonId, !isCompleted);
      setProgress(response.data);
      toast.success(
        isCompleted
          ? "Đã bỏ đánh dấu hoàn thành!"
          : "Đã đánh dấu hoàn thành bài học!"
      );
    } catch (err) {
      toast.error(err?.message || "Cập nhật tiến độ thất bại!");
    }
  };

  // THÊM BÀI HỌC
  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      const response = await createLesson(id, newLesson);
      setLessons([...lessons, response.data]);
      setNewLesson({ title: "", type: "video", url: "", isPreview: false });
      toast.success("Thêm bài học thành công!");
    } catch (err) {
      toast.error(err?.message || "Thêm bài học thất bại!");
    }
  };

  // SỬA BÀI HỌC
  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    try {
      const response = await updateLesson(id, editingLesson._id, newLesson);
      setLessons(
        lessons.map((item) =>
          item._id === editingLesson._id ? response.data : item
        )
      );
      setEditingLesson(null);
      setNewLesson({ title: "", type: "video", url: "", isPreview: false });
      toast.success("Cập nhật bài học thành công!");
    } catch (err) {
      toast.error(err?.message || "Cập nhật bài học thất bại!");
    }
  };

  // XOÁ BÀI HỌC
  const handleDeleteLesson = async (lessonId) => {
    try {
      await deleteLesson(id, lessonId);
      setLessons(lessons.filter((item) => item._id !== lessonId));
      toast.success("Xóa bài học thành công!");
    } catch (err) {
      toast.error(err?.message || "Xóa bài học thất bại!");
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setNewLesson({
      title: lesson.title,
      type: lesson.type,
      url: lesson.url,
      isPreview: lesson.isPreview,
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await createReview(id, newReview);
      setReviews([...reviews, response.data]);
      setNewReview({ rating: 5, comment: "" });
      toast.success("Gửi đánh giá thành công!");
    } catch (err) {
      toast.error(err?.message || "Gửi đánh giá thất bại!");
    }
  };

  const handleImageError = (e) => {
    e.target.src =
      "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png";
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!course) {
    return <div className="no-results">Khóa học không tồn tại.</div>;
  }

  // Tính phần trăm hoàn thành
  const totalLessons = lessons.length;
  const completedLessons = progress.completedContents.length;
  const completionPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="course-detail">
      <Helmet>
        <title>FunMath - {course.title}</title>
        <meta name="description" content={course.description} />
      </Helmet>
      <div className="course-container">
        <Link to="/courses" className="back-link">
          <i className="fas fa-arrow-left"></i> Quay lại danh sách khóa học
        </Link>
        <div className="course-header">
          <img
            src={course.thumbnail || "/assets/images/default-course.jpg"}
            alt={course.title}
            className="course-thumbnail"
            onError={handleImageError}
          />
          <div className="course-info">
            <h2>{course.title}</h2>
            <p className="course-description">{course.description}</p>
            <p className="course-price">
              Giá: {course.price.toLocaleString()} VND
            </p>
            <p className="course-instructor">
              Giảng viên: {course.instructorId?.username || "N/A"}
            </p>
            {user && (
              <button
                className={`bookmark-button ${
                  bookmarks.includes(id) ? "bookmarked" : ""
                }`}
                onClick={handleBookmark}
                aria-label={
                  bookmarks.includes(id) ? "Xóa bookmark" : "Bookmark khóa học"
                }
              >
                <i
                  className={
                    bookmarks.includes(id)
                      ? "fas fa-bookmark"
                      : "far fa-bookmark"
                  }
                ></i>
                {bookmarks.includes(id) ? " Đã bookmark" : " Bookmark"}
              </button>
            )}
          </div>
        </div>
        {user?.role === "student" && !user.enrolledCourses.includes(id) && (
          <div className="enroll-section">
            {course.price > 0 ? (
              <Link to={`/payment/${id}`} className="enroll-button">
                Thanh toán để đăng ký
              </Link>
            ) : (
              <button onClick={handleEnroll} className="enroll-button">
                Đăng ký miễn phí
              </button>
            )}
          </div>
        )}
        {(user?.role === "teacher" || user?.role === "admin") && (
          <div className="content-form-section">
            <h3>{editingLesson ? "Chỉnh sửa bài học" : "Thêm bài học"}</h3>
            <form
              onSubmit={editingLesson ? handleUpdateLesson : handleAddLesson}
              className="content-form"
            >
              <div className="form-group">
                <label>Tiêu đề</label>
                <input
                  type="text"
                  value={newLesson.title}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, title: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Loại</label>
                <select
                  value={newLesson.type}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, type: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="video">Video</option>
                  <option value="document">Tài liệu</option>
                  <option value="quiz">Bài kiểm tra</option>
                </select>
              </div>
              <div className="form-group">
                <label>URL</label>
                <input
                  type="url"
                  value={newLesson.url}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, url: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newLesson.isPreview}
                    onChange={(e) =>
                      setNewLesson({
                        ...newLesson,
                        isPreview: e.target.checked,
                      })
                    }
                  />
                  Cho phép xem trước
                </label>
              </div>
              <button type="submit" className="form-button">
                {editingLesson ? "Cập nhật bài học" : "Thêm bài học"}
              </button>
              {editingLesson && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingLesson(null);
                    setNewLesson({
                      title: "",
                      type: "video",
                      url: "",
                      isPreview: false,
                    });
                  }}
                  className="cancel-button"
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </form>
          </div>
        )}
        {user?.enrolledCourses.includes(id) && (
          <div className="progress-section">
            <h3>Tiến độ học tập</h3>
            <p>
              Bạn đã hoàn thành {completedLessons}/{totalLessons} bài học (
              {completionPercentage}%)
            </p>
            {completionPercentage === 100 && (
              <p className="completed-message">
                Chúc mừng! Bạn đã hoàn thành khóa học!
              </p>
            )}
          </div>
        )}
        <div className="contents-section">
          <h3>Nội dung khóa học</h3>
          {lessons?.length > 0 ? (
            <ul className="contents-list">
              {lessons.map((lesson) => (
                <li key={lesson._id} className="content-item">
                  <div className="content-info">
                    {user?.enrolledCourses.includes(id) || lesson.isPreview ? (
                      <a
                        href={lesson.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="content-link"
                      >
                        {lesson.title} (
                        {lesson.type === "video"
                          ? "Video"
                          : lesson.type === "document"
                          ? "Tài liệu"
                          : "Bài kiểm tra"}
                        )
                        {lesson.isPreview && (
                          <span className="preview-tag">(Xem trước)</span>
                        )}
                      </a>
                    ) : (
                      <span className="content-locked">
                        {lesson.title} (
                        {lesson.type === "video"
                          ? "Video"
                          : lesson.type === "document"
                          ? "Tài liệu"
                          : "Bài kiểm tra"}
                        ) - Đăng ký để xem
                      </span>
                    )}
                    {user?.enrolledCourses.includes(id) && (
                      <button
                        onClick={() => handleCompleteLesson(lesson._id)}
                        className={`complete-button ${
                          progress.completedContents.includes(lesson._id)
                            ? "completed"
                            : ""
                        }`}
                      >
                        {progress.completedContents.includes(lesson._id)
                          ? "Đã hoàn thành"
                          : "Đánh dấu hoàn thành"}
                      </button>
                    )}
                  </div>
                  {(user?.role === "teacher" || user?.role === "admin") && (
                    <div className="content-actions">
                      <button
                        onClick={() => handleEditLesson(lesson)}
                        className="edit-button"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson._id)}
                        className="delete-button"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-results">Chưa có nội dung nào.</p>
          )}
        </div>
        <div className="reviews-section">
          <h3>Đánh giá khóa học</h3>
          {user?.enrolledCourses.includes(id) && (
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="form-group">
                <label>Số sao</label>
                <select
                  value={newReview.rating}
                  onChange={(e) =>
                    setNewReview({
                      ...newReview,
                      rating: Number(e.target.value),
                    })
                  }
                  className="form-select"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <option key={star} value={star}>
                      {star} sao
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Bình luận</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  className="form-textarea"
                />
              </div>
              <button type="submit" className="form-button">
                Gửi đánh giá
              </button>
            </form>
          )}
          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <p className="review-header">
                    {review.userId?.username || "Ẩn danh"} - {review.rating} sao
                  </p>
                  <p className="review-comment">{review.comment}</p>
                  <p className="review-date">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              ))
            ) : (
              <p className="no-results">Chưa có đánh giá nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
