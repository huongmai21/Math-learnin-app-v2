import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getDocuments } from "../../services/documentService";
import { Link, useParams } from "react-router-dom";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import "./Document.css";

const DocumentList = () => {
  const { user } = useSelector((state) => state.auth);
  const { educationLevel } = useParams(); 
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState({
    educationLevel: educationLevel || "",
    grade: "",
    subject: "",
    documentType: "",
    search: "",
    page: 1,
    limit: 12,
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDocuments();
  }, [filter, educationLevel]);

  const fetchDocuments = async () => {
    try {
      const response = await getDocuments(filter);
      setDocuments(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      toast.error("Không thể lấy danh sách tài liệu");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
      page: 1, 
    }));
  };

  const handlePageChange = (newPage) => {
    setFilter((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleSearch = (searchTerm) => {
    setFilter((prev) => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  return (
    <div className="document-list-container">
      <h1 className="section-title">Thư viện tài liệu</h1>
      <SearchBar
        placeholder="Tìm kiếm tài liệu..."
        onSearch={handleSearch}
        className="document-search-bar"
      />
      <div className="filter-section">
        <div className="form-group">
          <label>Tìm kiếm</label>
          <input
            type="text"
            name="search"
            value={filter.search}
            onChange={handleFilterChange}
            placeholder="Tìm theo tiêu đề, mô tả, thẻ..."
          />
        </div>
        <div className="form-group">
          <label>Cấp học</label>
          <select
            name="educationLevel"
            value={filter.educationLevel}
            onChange={handleFilterChange}
            disabled={!!educationLevel} // Vô hiệu hóa nếu educationLevel từ URL
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
      </div>
      <div className="document-grid">
        {documents.map((doc) => (
          <Link
            to={`/documents/${doc._id}`}
            key={doc._id}
            className="document-card"
          >
            <div className="document-thumbnail">
              <img
                src={doc.thumbnail || "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934624/1_bsngjz.png?height=150&width=250"}
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
              </div>
            </div>
          </Link>
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
  );
};

export default DocumentList;