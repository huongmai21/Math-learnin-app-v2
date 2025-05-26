import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getAllExams,
  createExam,
  updateExam,
  deleteExam,
} from "../../services/examService";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import "./AdminDashboard.css"; // Tái sử dụng CSS từ AdminDashboard

const ExamManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [exams, setExams] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    educationLevel: "primary",
    subject: "",
    duration: 60,
    startTime: "",
    endTime: "",
    difficulty: "easy",
    maxAttempts: 1,
  });
  const [filter, setFilter] = useState({
    educationLevel: "",
    subject: "",
    difficulty: "",
    status: "",
    search: "",
    page: 1,
    limit: 12,
    sortBy: "startTime",
    sortOrder: "desc",
  });
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("exams");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExams();
  }, [filter]);

  const fetchExams = async () => {
    try {
      const response = await getAllExams(filter);
      setExams(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      toast.error("Không thể lấy danh sách đề thi");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handleSearch = (searchTerm) => {
    setFilter((prev) => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const handleSortChange = (e) => {
    const { value } = e.target;
    const [sortBy, sortOrder] = value.split(":");
    setFilter((prev) => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilter((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const examData = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      if (editingId) {
        await updateExam(editingId, examData);
        toast.success("Cập nhật đề thi thành công!");
        setEditingId(null);
      } else {
        await createExam(examData);
        toast.success("Tạo đề thi thành công!");
      }
      setFormData({
        title: "",
        description: "",
        educationLevel: "primary",
        subject: "",
        duration: 60,
        startTime: "",
        endTime: "",
        difficulty: "easy",
        maxAttempts: 1,
      });
      setShowForm(false);
      fetchExams();
    } catch (error) {
      toast.error(error.message || "Lỗi khi xử lý đề thi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (exam) => {
    setEditingId(exam._id);
    setFormData({
      title: exam.title,
      description: exam.description,
      educationLevel: exam.educationLevel,
      subject: exam.subject || "",
      duration: exam.duration,
      startTime: new Date(exam.startTime).toISOString().slice(0, 16),
      endTime: new Date(exam.endTime).toISOString().slice(0, 16),
      difficulty: exam.difficulty,
      maxAttempts: exam.maxAttempts,
    });
    setShowForm(true);
    setTimeout(() => {
      const formElement = document.querySelector(".create-exam-form");
      if (formElement) formElement.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa đề thi này?")) {
      try {
        await deleteExam(id);
        toast.success("Xóa đề thi thành công!");
        fetchExams();
      } catch (error) {
        toast.error(error.message || "Lỗi khi xóa đề thi");
      }
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="admin-dashboard-container">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        tabs="admin"
      />
      <div className="admin-content">
        <h1 className="section-title">Quản lý đề thi</h1>
        <div className="search-section">
          <SearchBar
            placeholder="Tìm kiếm đề thi..."
            onSearch={handleSearch}
            type="exam"
            className="admin-search-bar"
          />
        </div>
        <div className="filter-section">
          <div className="form-group">
            <label>Cấp học</label>
            <select
              name="educationLevel"
              value={filter.educationLevel}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              <option value="primary">Tiểu học</option>
              <option value="secondary">THCS</option>
              <option value="highschool">THPT</option>
              <option value="university">Đại học</option>
            </select>
          </div>
          <div className="form-group">
            <label>Môn học</label>
            <select
              name="subject"
              value={filter.subject}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              <option value="math">Toán</option>
              <option value="advanced_math">Toán Nâng Cao</option>
              <option value="calculus">Giải Tích</option>
              <option value="algebra">Đại Số</option>
              <option value="probability_statistics">Xác Suất & Thống Kê</option>
              <option value="differential_equations">Phương Trình Vi Phân</option>
            </select>
          </div>
          <div className="form-group">
            <label>Độ khó</label>
            <select
              name="difficulty"
              value={filter.difficulty}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="ended">Đã kết thúc</option>
            </select>
          </div>
          <div className="form-group">
            <label>Sắp xếp</label>
            <select
              name="sort"
              value={`${filter.sortBy}:${filter.sortOrder}`}
              onChange={handleSortChange}
            >
              <option value="startTime:desc">Mới nhất</option>
              <option value="startTime:asc">Cũ nhất</option>
              <option value="totalScore:desc">Điểm cao nhất</option>
              <option value="totalScore:asc">Điểm thấp nhất</option>
            </select>
          </div>
        </div>
        <button
          className="submit-button"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              title: "",
              description: "",
              educationLevel: "primary",
              subject: "",
              duration: 60,
              startTime: "",
              endTime: "",
              difficulty: "easy",
              maxAttempts: 1,
            });
          }}
        >
          Thêm đề thi
        </button>
        {showForm && (
          <div className="create-exam-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tiêu đề</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Cấp học</label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleInputChange}
                >
                  <option value="primary">Tiểu học</option>
                  <option value="secondary">THCS</option>
                  <option value="highschool">THPT</option>
                  <option value="university">Đại học</option>
                </select>
              </div>
              <div className="form-group">
                <label>Môn học</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                >
                  <option value="">Chọn môn học</option>
                  <option value="math">Toán</option>
                  <option value="advanced_math">Toán Nâng Cao</option>
                  <option value="calculus">Giải Tích</option>
                  <option value="algebra">Đại Số</option>
                  <option value="probability_statistics">Xác Suất & Thống Kê</option>
                  <option value="differential_equations">Phương Trình Vi Phân</option>
                </select>
              </div>
              <div className="form-group">
                <label>Thời gian (phút)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Thời gian bắt đầu</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Thời gian kết thúc</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Độ khó</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
              <div className="form-group">
                <label>Số lượt làm tối đa</label>
                <input
                  type="number"
                  name="maxAttempts"
                  value={formData.maxAttempts}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {editingId ? "Cập nhật đề thi" : "Tạo đề thi"}
                </button>
                <button
                  type="button"
                  className="bookmark-button"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="exams-section">
          <h2 className="section-title">Danh sách đề thi</h2>
          <div className="document-grid">
            {exams.map((exam) => (
              <div key={exam._id} className="document-card">
                <div className="document-content">
                  <h3>{exam.title}</h3>
                  <p className="document-description">
                    {exam.description?.slice(0, 100)}...
                  </p>
                  <div className="document-meta">
                    <span className="document-level">
                      {exam.educationLevel === "primary"
                        ? "Tiểu học"
                        : exam.educationLevel === "secondary"
                        ? "THCS"
                        : exam.educationLevel === "highschool"
                        ? "THPT"
                        : "Đại học"}
                    </span>
                    {exam.subject && (
                      <span>
                        {
                          {
                            math: "Toán",
                            advanced_math: "Toán Nâng Cao",
                            calculus: "Giải Tích",
                            algebra: "Đại Số",
                            probability_statistics: "Xác Suất & Thống Kê",
                            differential_equations: "Phương Trình Vi Phân",
                          }[exam.subject]
                        }
                      </span>
                    )}
                    <span>Độ khó: {exam.difficulty === "easy" ? "Dễ" : exam.difficulty === "medium" ? "Trung bình" : "Khó"}</span>
                    <span>Thời gian: {exam.duration} phút</span>
                    <span>Bắt đầu: {new Date(exam.startTime).toLocaleString()}</span>
                    <span>Kết thúc: {new Date(exam.endTime).toLocaleString()}</span>
                    <span>Số lượt làm tối đa: {exam.maxAttempts}</span>
                  </div>
                  <div className="document-actions-row">
                    <button
                      onClick={() => handleEdit(exam)}
                      className="download-button"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(exam._id)}
                      className="bookmark-button"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={filter.page === page ? "active" : ""}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamManagement;