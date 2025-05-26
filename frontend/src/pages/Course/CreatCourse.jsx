import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { createCourse } from "../../services/courseService";
import "./CreateCourse.css";

const CreateCourse = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "grade1",
    price: 0,
    thumbnail: "",
    contents: [],
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (index, field, value) => {
    const newContents = [...formData.contents];
    newContents[index] = { ...newContents[index], [field]: value };
    setFormData((prev) => ({ ...prev, contents: newContents }));
  };

  const addContent = () => {
    setFormData((prev) => ({
      ...prev,
      contents: [...prev.contents, { title: "", type: "video", url: "" }],
    }));
  };

  const removeContent = (index) => {
    setFormData((prev) => ({
      ...prev,
      contents: prev.contents.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.role !== "teacher" && user.role !== "admin") {
      toast.error("Bạn không có quyền tạo khóa học!");
      return;
    }
    setLoading(true);
    try {
      await createCourse(formData, user);
      toast.success("Tạo khóa học thành công!");
      navigate("/courses/my-courses");
    } catch (err) {
      toast.error(err.message || "Tạo khóa học thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course">
      <Helmet>
        <title>FunMath - Tạo khóa học mới</title>
        <meta name="description" content="Tạo khóa học mới trên FunMath." />
      </Helmet>
      <div className="create-course-container">
        <h2>Tạo khóa học mới</h2>
        <form onSubmit={handleSubmit} className="create-course-form">
          <div className="form-group">
            <label>Tiêu đề:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Mô tả:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Danh mục:</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="grade1">Toán cấp 1</option>
              <option value="grade2">Toán cấp 2</option>
              <option value="grade3">Toán cấp 3</option>
              <option value="university">Toán đại học</option>
            </select>
          </div>
          <div className="form-group">
            <label>Giá (VND):</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Thumbnail URL:</label>
            <input
              type="text"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <h3>Nội dung khóa học</h3>
            {formData.contents.map((content, index) => (
              <div key={index} className="content-item">
                <input
                  type="text"
                  placeholder="Tiêu đề nội dung"
                  value={content.title}
                  onChange={(e) => handleContentChange(index, "title", e.target.value)}
                  required
                />
                <select
                  value={content.type}
                  onChange={(e) => handleContentChange(index, "type", e.target.value)}
                >
                  <option value="video">Video</option>
                  <option value="document">Tài liệu</option>
                </select>
                <input
                  type="text"
                  placeholder="URL nội dung"
                  value={content.url}
                  onChange={(e) => handleContentChange(index, "url", e.target.value)}
                  required
                />
                <button type="button" onClick={() => removeContent(index)}>
                  Xóa
                </button>
              </div>
            ))}
            <button type="button" onClick={addContent}>
              Thêm nội dung
            </button>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo khóa học"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;