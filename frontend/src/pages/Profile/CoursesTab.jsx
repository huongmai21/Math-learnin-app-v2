"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { unenrollCourse } from "../../services/courseService";
import Skeleton from "../../components/ui/Skeleton";

const CoursesTab = ({ profileData, courses = [], newCourse, setNewCourse, handleCreateCourse }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(newCourse.thumbnail || "");

  useEffect(() => {
    const loadCloudinaryScript = () => {
      const script = document.createElement("script");
      script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
      script.async = true;
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    };
    loadCloudinaryScript();
  }, []);

  const openCloudinaryWidget = () => {
    if (window.cloudinary) {
      window.cloudinary
        .createUploadWidget(
          {
            cloudName: "duyqt3bpy",
            uploadPreset: "ml_default",
            folder: "covers",
            sources: ["local", "url", "camera"],
            multiple: false,
            resourceType: "image",
          },
          (error, result) => {
            if (!error && result && result.event === "success") {
              const url = result.info.secure_url;
              setNewCourse((prev) => ({ ...prev, thumbnail: url }));
              setThumbnailPreview(url);
              toast.success("Đã tải lên thumbnail!");
            } else if (error) {
              toast.error("Lỗi tải lên ảnh: " + (error.message || "Vui lòng thử lại."));
            }
          }
        )
        .open();
    } else {
      toast.error("Không thể tải Cloudinary Widget. Vui lòng thử lại.");
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đăng ký khóa học này?")) return;
    try {
      await unenrollCourse(courseId);
      toast.success("Đã hủy đăng ký khóa học!");
      window.location.reload();
    } catch (error) {
      toast.error("Không thể hủy đăng ký: " + (error.message || "Vui lòng thử lại."));
    }
  };

  return (
    <div className="courses-tab">
      <div className="courses-header">
        <h2>{profileData.role === "student" ? "Khóa học đã đăng ký" : "Khóa học của tôi"}</h2>
        {profileData.role === "teacher" && (
          <button className="btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            <i className="fas fa-plus"></i> Tạo khóa học mới
          </button>
        )}
      </div>

      {profileData.role === "teacher" && showCreateForm && (
        <div className="create-course-form">
          <h3>Tạo khóa học mới</h3>
          <form onSubmit={handleCreateCourse}>
            <div className="form-group">
              <label htmlFor="course-title">Tiêu đề</label>
              <input
                type="text"
                id="course-title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                placeholder="Nhập tiêu đề khóa học..."
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="course-description">Mô tả</label>
              <textarea
                id="course-description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Nhập mô tả khóa học..."
                rows="4"
              ></textarea>
            </div>
            <div className="form-group">
              <label>Thumbnail</label>
              <div className="upload-preview">
                {thumbnailPreview && (
                  <img src={thumbnailPreview} alt="Thumbnail Preview" className="thumbnail-preview" />
                )}
                <button type="button" className="btn-secondary" onClick={openCloudinaryWidget}>
                  <i className="fas fa-upload"></i> Tải lên thumbnail
                </button>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="course-price">Giá (VND)</label>
                <input
                  type="number"
                  id="course-price"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({ ...newCourse, price: Number.parseInt(e.target.value) || 0 })}
                  min="0"
                  step="1000"
                />
              </div>
              <div className="form-group">
                <label htmlFor="course-public">Trạng thái</label>
                <select
                  id="course-public"
                  value={newCourse.isPublic ? "public" : "private"}
                  onChange={(e) => setNewCourse({ ...newCourse, isPublic: e.target.value === "public" })}
                >
                  <option value="public">Công khai</option>
                  <option value="private">Riêng tư</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <i className="fas fa-save"></i> Lưu khóa học
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
                <i className="fas fa-times"></i> Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="courses-content">
        {courses.length > 0 ? (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course._id} className="course-card">
                <div className="course-image">
                  <img
                    src={course.thumbnail || "/placeholder.svg?height=150&width=300"}
                    alt={course.title}
                    loading="lazy"
                  />
                  {profileData.role === "teacher" && (
                    <div className="course-status">
                      <span className={course.status}>
                        {course.status === "pending"
                          ? "Chờ duyệt"
                          : course.status === "approved"
                          ? "Đã duyệt"
                          : "Bị từ chối"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="course-content">
                  <h3>{course.title}</h3>
                  {course.description && <p className="course-description">{course.description}</p>}
                  <div className="course-meta">
                    <span>
                      <i className="fas fa-users"></i> {course.enrollmentsCount || 0} học viên
                    </span>
                    <span>
                      <i className="fas fa-star"></i> {course.rating || 0}/5
                    </span>
                  </div>
                  <div className="course-footer">
                    <span className="course-price">
                      {course.price ? `${course.price.toLocaleString("vi-VN")} VND` : "Miễn phí"}
                    </span>
                    <div className="course-actions">
                      <Link to={`/courses/${course._id}`} className="btn-primary">
                        <i className="fas fa-eye"></i> Xem
                      </Link>
                      {profileData.role === "student" && (
                        <button className="btn-danger" onClick={() => handleUnenroll(course._id)}>
                          <i className="fas fa-times"></i> Hủy đăng ký
                        </button>
                      )}
                      {profileData.role === "teacher" && (
                        <Link to={`/courses/edit/${course._id}`} className="btn-secondary">
                          <i className="fas fa-edit"></i> Sửa
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>{profileData.role === "student" ? "Bạn chưa đăng ký khóa học nào" : "Bạn chưa tạo khóa học nào"}</p>
            {profileData.role === "student" ? (
              <Link to="/courses" className="btn-primary">
                <i className="fas fa-graduation-cap"></i> Khám phá khóa học
              </Link>
            ) : (
              <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
                <i className="fas fa-plus"></i> Tạo khóa học đầu tiên
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesTab;