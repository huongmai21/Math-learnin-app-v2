import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { getCourseById, updateCourse, deleteCourse } from "../../services/courseService";
import "./EditCourse.css";

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: 0,
    thumbnail: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !token) {
      toast.error("Vui lòng đăng nhập để chỉnh sửa khóa học!");
      navigate("/auth/login");
      return;
    }

    const fetchCourse = async () => {
      setLoading(true);
      try {
        const response = await getCourseById(id);
        const course = response.data;
        if (course.instructorId._id !== user._id && user.role !== "admin") {
          toast.error("Bạn không có quyền chỉnh sửa khóa học này!");
          navigate("/courses");
          return;
        }
        setCourseData({
          title: course.title,
          description: course.description,
          price: course.price,
          thumbnail: course.thumbnail,
          category: course.category || "",
        });
      } catch (err) {
        setError(err || "Không thể tải thông tin khóa học!");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, user, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCourse(id, courseData);
      toast.success("Cập nhật khóa học thành công!");
      navigate(`/courses/${id}`);
    } catch (err) {
      toast.error(err || "Cập nhật khóa học thất bại!");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc muốn xóa khóa học này?")) {
      try {
        await deleteCourse(id);
        toast.success("Xóa khóa học thành công!");
        navigate("/courses");
      } catch (err) {
        toast.error(err || "Xóa khóa học thất bại!");
      }
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="edit-course">
      <Helmet>
        <title>FunMath - Chỉnh sửa khóa học</title>
        <meta name="description" content="Chỉnh sửa thông tin khóa học của bạn." />
      </Helmet>
      <div className="edit-course-container">
        <Link to={`/courses/${id}`} className="back-link">
          <i className="fas fa-arrow-left"></i> Quay lại khóa học
        </Link>
        <h2>Chỉnh sửa khóa học</h2>
        <form onSubmit={handleSubmit} className="edit-course-form">
          <div className="form-group">
            <label>Tiêu đề</label>
            <input
              type="text"
              name="title"
              value={courseData.title}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              value={courseData.description}
              onChange={handleChange}
              required
              className="form-textarea"
            />
          </div>
          <div className="form-group">
            <label>Giá (VND)</label>
            <input
              type="number"
              name="price"
              value={courseData.price}
              onChange={handleChange}
              min="0"
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Thumbnail URL</label>
            <input
              type="url"
              name="thumbnail"
              value={courseData.thumbnail}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Danh mục</label>
            <select
              name="category"
              value={courseData.category}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Chọn danh mục</option>
              <option value="grade1">Toán cấp 1</option>
              <option value="grade2">Toán cấp 2</option>
              <option value="grade3">Toán cấp 3</option>
              <option value="university">Toán đại học</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-button">
              Cập nhật khóa học
            </button>
            <button type="button" onClick={handleDelete} className="delete-button">
              Xóa khóa học
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;