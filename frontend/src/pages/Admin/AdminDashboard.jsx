import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  createDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
} from "../../services/documentService";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [documents, setDocuments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    educationLevel: "primary",
    grade: "",
    subject: "",
    documentType: "textbook",
    tags: "",
    file: null,
    thumbnail: null,
  });
  const [filter, setFilter] = useState({
    educationLevel: "",
    grade: "",
    subject: "",
    documentType: "",
    search: "",
    page: 1,
    limit: 12,
    sortBy: "uploadedAt",
    sortOrder: "desc",
  });
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("library");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    try {
      const response = await getDocuments(filter);
      setDocuments(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      toast.error("Không thể lấy danh sách tài liệu");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
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
    if (isSubmitting) return; // Ngăn submit nếu đang xử lý
    setIsSubmitting(true);
    try {
      const documentData = {
        title: formData.title,
        description: formData.description,
        educationLevel: formData.educationLevel,
        grade:
          formData.educationLevel !== "university" ? formData.grade : undefined,
        subject:
          formData.educationLevel === "university" ? formData.subject : null,
        documentType: formData.documentType,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
        file: formData.file,
        thumbnail: formData.thumbnail,
      };

      if (editingId) {
        await updateDocument(editingId, documentData);
        toast.success("Cập nhật tài liệu thành công!");
        setEditingId(null);
      } else {
        console.log(documentData); // Debug
        await createDocument(documentData);
        toast.success("Tạo tài liệu thành công!");
      }
      setFormData({
        title: "",
        description: "",
        educationLevel: "primary",
        grade: "",
        subject: "",
        documentType: "textbook",
        tags: "",
        file: null,
        thumbnail: null,
      });
      setShowForm(false);
      fetchDocuments();
    } catch (error) {
      toast.error(error.message || "Lỗi khi xử lý tài liệu");
    } finally {
      setIsSubmitting(false); // Kết thúc xử lý
    }
  };

  const handleEdit = (doc) => {
    setEditingId(doc._id);
    setFormData({
      title: doc.title,
      description: doc.description,
      educationLevel: doc.educationLevel,
      grade: doc.grade || "",
      subject: doc.subject || "",
      documentType: doc.documentType,
      tags: doc.tags?.join(", ") || "",
      file: null,
      thumbnail: null,
    });
    setShowForm(true);
    // Tự động cuộn đến form tạo tài liệu
    setTimeout(() => {
    const formElement = document.querySelector('.create-document-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  }, 100);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa tài liệu này?")) {
      try {
        await deleteDocument(id);
        toast.success("Xóa tài liệu thành công!");
        fetchDocuments();
      } catch (error) {
        toast.error(error.message || "Lỗi khi xóa tài liệu");
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
        <h1 className="section-title">Quản lý tài liệu</h1>
        <div className="search-section">
          <SearchBar
            placeholder="Tìm kiếm tài liệu..."
            onSearch={handleSearch}
            type="document"
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
            <label>Lớp</label>
            <select
              name="grade"
              value={filter.grade}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(
                (g) => (
                  <option key={g} value={g}>
                    Lớp {g}
                  </option>
                )
              )}
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
              <option value="advanced_math">Toán Nâng Cao</option>
              <option value="calculus">Giải Tích</option>
              <option value="algebra">Đại Số</option>
              <option value="probability_statistics">Xác Suất & Thống Kê</option>
              <option value="differential_equations">Phương Trình Vi Phân</option>
            </select>
          </div>
          <div className="form-group">
            <label>Loại tài liệu</label>
            <select
              name="documentType"
              value={filter.documentType}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              <option value="textbook">Sách giáo khoa</option>
              <option value="exercise_book">Sách bài tập</option>
              <option value="special_topic">Chuyên đề</option>
              <option value="reference">Tài liệu tham khảo</option>
              <option value="exercise">Bài tập</option>
            </select>
          </div>
          <div className="form-group">
            <label>Sắp xếp</label>
            <select
              name="sort"
              value={`${filter.sortBy}:${filter.sortOrder}`}
              onChange={handleSortChange}
            >
              <option value="uploadedAt:desc">Mới nhất</option>
              <option value="uploadedAt:asc">Cũ nhất</option>
              <option value="views:desc">Lượt xem cao nhất</option>
              <option value="views:asc">Lượt xem thấp nhất</option>
              <option value="downloads:desc">Lượt tải cao nhất</option>
              <option value="downloads:asc">Lượt tải thấp nhất</option>
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
              grade: "",
              subject: "",
              documentType: "textbook",
              tags: "",
              file: null,
              thumbnail: null,
            });
          }}
        >
          Thêm tài liệu
        </button>
        {showForm && (
          <div className="create-document-form">
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
              {formData.educationLevel !== "university" && (
                <div className="form-group">
                  <label>Lớp</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn lớp</option>
                    {formData.educationLevel === "primary" &&
                      ["1", "2", "3", "4", "5"].map((g) => (
                        <option key={g} value={g}>
                          Lớp {g}
                        </option>
                      ))}
                    {formData.educationLevel === "secondary" &&
                      ["6", "7", "8", "9"].map((g) => (
                        <option key={g} value={g}>
                          Lớp {g}
                        </option>
                      ))}
                    {formData.educationLevel === "highschool" &&
                      ["10", "11", "12"].map((g) => (
                        <option key={g} value={g}>
                          Lớp {g}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              {formData.educationLevel === "university" && (
                <div className="form-group">
                  <label>Môn học</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn môn học</option>
                    <option value="advanced_math">Toán Nâng Cao</option>
                    <option value="calculus">Giải Tích</option>
                    <option value="algebra">Đại Số</option>
                    <option value="probability_statistics">
                      Xác Suất & Thống Kê
                    </option>
                    <option value="differential_equations">
                      Phương Trình Vi Phân
                    </option>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Loại tài liệu</label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                >
                  <option value="textbook">Sách giáo khoa</option>
                  <option value="exercise_book">Sách bài tập</option>
                  <option value="special_topic">Chuyên đề</option>
                  <option value="reference">Tài liệu tham khảo</option>
                  <option value="exercise">Bài tập</option>
                </select>
              </div>
              <div className="form-group">
                <label>Thẻ (phân tách bằng dấu phẩy)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="VD: toán, bài tập, đại số"
                />
              </div>
              <div className="form-group">
                <label>File tài liệu (PDF, DOC, DOCX)</label>
                <input
                  type="file"
                  name="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleInputChange}
                  required={!editingId}
                />
              </div>
              <div className="form-group">
                <label>Hình thu nhỏ (tùy chọn)</label>
                <input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {editingId ? "Cập nhật tài liệu" : "Tạo tài liệu"}
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
        <div className="documents-section">
          <h2 className="section-title">Danh sách tài liệu</h2>
          <div className="document-grid">
            {documents.map((doc) => (
              <div key={doc._id} className="document-card">
                <div className="document-thumbnail">
                  <img
                    src={doc.thumbnail || "/placeholder.svg?height=150&width=250"}
                    alt={doc.title}
                  />
                </div>
                <div className="document-content">
                  <h3>{doc.title}</h3>
                  <p className="document-description">
                    {doc.description?.slice(0, 100)}...
                  </p>
                  <div className="document-meta">
                    <span className="document-level">
                      {doc.educationLevel === "primary"
                        ? "Tiểu học"
                        : doc.educationLevel === "secondary"
                        ? "THCS"
                        : doc.educationLevel === "highschool"
                        ? "THPT"
                        : "Đại học"}
                    </span>
                    {doc.grade && <span>Lớp {doc.grade}</span>}
                    {doc.subject && (
                      <span>
                        {
                          {
                            advanced_math: "Toán Nâng Cao",
                            calculus: "Giải Tích",
                            algebra: "Đại Số",
                            probability_statistics: "Xác Suất & Thống Kê",
                            differential_equations: "Phương Trình Vi Phân",
                          }[doc.subject]
                        }
                      </span>
                    )}
                    <span>
                      {doc.documentType === "textbook"
                        ? "Sách giáo khoa"
                        : doc.documentType === "exercise_book"
                        ? "Sách bài tập"
                        : doc.documentType === "special_topic"
                        ? "Chuyên đề"
                        : doc.documentType === "reference"
                        ? "Tài liệu tham khảo"
                        : "Bài tập"}
                    </span>
                    <span>Lượt xem: {doc.views}</span>
                    <span>Lượt tải: {doc.downloads}</span>
                    <span>Ngày đăng: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    {doc.tags?.length > 0 && (
                      <span>Thẻ: {doc.tags.join(", ")}</span>
                    )}
                  </div>
                  <div className="document-actions-row">
                    <button
                      onClick={() => handleEdit(doc)}
                      className="download-button"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id)}
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

export default AdminDashboard;