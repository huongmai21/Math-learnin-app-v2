"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createDocument } from "../../services/documentService";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./Document.css";

const educationLevels = [
  { value: "primary", label: "Tiểu học" },
  { value: "secondary", label: "Trung học cơ sở" },
  { value: "highschool", label: "Trung học phổ thông" },
  { value: "university", label: "Đại học" },
];

const grades = {
  primary: ["1", "2", "3", "4", "5"],
  secondary: ["6", "7", "8", "9"],
  highschool: ["10", "11", "12"],
};

const universitySubjects = [
  { value: "advanced_math", label: "Toán cao cấp" },
  { value: "calculus", label: "Giải tích" },
  { value: "algebra", label: "Đại số" },
  { value: "probability_statistics", label: "Xác suất thống kê" },
  { value: "differential_equations", label: "Phương trình vi phân" },
];

const documentTypes = {
  primary: [
    { value: "textbook", label: "SGK" },
    { value: "exercise_book", label: "SBT" },
    { value: "special_topic", label: "Chuyên đề/Đề thi" },
  ],
  secondary: [
    { value: "textbook", label: "SGK" },
    { value: "exercise_book", label: "SBT" },
    { value: "special_topic", label: "Chuyên đề/Đề thi" },
  ],
  highschool: [
    { value: "textbook", label: "SGK" },
    { value: "exercise_book", label: "SBT" },
    { value: "special_topic", label: "Chuyên đề/Đề thi" },
  ],
  university: [
    { value: "textbook", label: "Giáo trình" },
    { value: "exercise", label: "Bài tập" },
    { value: "reference", label: "Tài liệu tham khảo" },
  ],
};

const CreateDocument = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    file: null,
    thumbnail: null,
    educationLevel: "",
    grade: "",
    subject: "",
    documentType: "",
    tags: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast.error("Chỉ admin mới có thể tạo tài liệu!");
      navigate("/documents");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
      ...(name === "educationLevel" ? { grade: "", subject: "" } : {}),
    }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
    // Gợi ý tags dựa trên nội dung (regex đơn giản)
    const tags = content.match(/#\w+/g)?.map((tag) => tag.slice(1)) || [];
    setSuggestedTags(tags);
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [field]: file }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm("Bạn có chắc muốn tạo tài liệu này?")) return;
    setError("");
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("content", formData.content);
      if (formData.file) data.append("file", formData.file);
      if (formData.thumbnail) data.append("thumbnail", formData.thumbnail);
      data.append("educationLevel", formData.educationLevel);
      if (formData.grade) data.append("grade", formData.grade);
      if (formData.subject) data.append("subject", formData.subject);
      data.append("documentType", formData.documentType);
      data.append(
        "tags",
        [
          ...suggestedTags,
          ...formData.tags.split(",").map((t) => t.trim()),
        ].join(",")
      );

      await createDocument(data);
      toast.success("Tài liệu đã được tạo thành công!");
      navigate("/documents");
    } catch (err) {
      setError(err.response?.data?.message || "Tạo tài liệu thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="create-document">
        <h2 className="create-document-title">Tạo tài liệu mới</h2>
        {error && <p className="error-message">{error}</p>}
        <form
          onSubmit={handleSubmit}
          className="create-document-form"
          encType="multipart/form-data"
        >
          <div className="form-group">
            <label className="form-label">Tiêu đề tài liệu</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="Nhập tiêu đề"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Nhập mô tả"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nội dung (Hỗ trợ MathJax)</label>
            <ReactQuill
              value={formData.content}
              onChange={handleContentChange}
              className="quill-editor"
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline"],
                  ["image", "code-block"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link"],
                  ["clean"],
                ],
              }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tệp tài liệu (PDF, Word)</label>
            <div
              onDrop={(e) => handleDrop(e, "file")}
              onDragOver={handleDragOver}
              style={{
                border: "2px dashed #ccc",
                padding: "20px",
                textAlign: "center",
                borderRadius: "4px",
              }}
            >
              {formData.file
                ? formData.file.name
                : "Kéo thả tệp hoặc click để chọn"}
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="form-input"
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                style={{ cursor: "pointer", color: "#1e90ff" }}
              >
                Chọn tệp
              </label>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Hình thu nhỏ</label>
            <div
              onDrop={(e) => handleDrop(e, "thumbnail")}
              onDragOver={handleDragOver}
              style={{
                border: "2px dashed #ccc",
                padding: "20px",
                textAlign: "center",
                borderRadius: "4px",
              }}
            >
              {formData.thumbnail
                ? formData.thumbnail.name
                : "Kéo thả hình hoặc click để chọn"}
              <input
                type="file"
                name="thumbnail"
                onChange={handleChange}
                className="form-input"
                accept="image/*"
                style={{ display: "none" }}
                id="thumbnailInput"
              />
              <label
                htmlFor="thumbnailInput"
                style={{ cursor: "pointer", color: "#1e90ff" }}
              >
                Chọn hình
              </label>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Cấp học</label>
            <select
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Chọn cấp học</option>
              {educationLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          {formData.educationLevel &&
            formData.educationLevel !== "university" && (
              <div className="form-group">
                <label className="form-label">Lớp</label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Chọn lớp</option>
                  {grades[formData.educationLevel]?.map((grade) => (
                    <option key={grade} value={grade}>
                      Lớp {grade}
                    </option>
                  ))}
                </select>
              </div>
            )}
          {formData.educationLevel === "university" && (
            <div className="form-group">
              <label className="form-label">Môn học</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Chọn môn học</option>
                {universitySubjects.map((subject) => (
                  <option key={subject.value} value={subject.value}>
                    {subject.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Loại tài liệu</label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Chọn loại tài liệu</option>
              {formData.educationLevel &&
                documentTypes[formData.educationLevel]?.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Thẻ (cách nhau bằng dấu phẩy)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="form-input"
              placeholder="Nhập các thẻ (gợi ý: #tag)"
            />
            {suggestedTags.length > 0 && (
              <p style={{ color: "#666", marginTop: "5px" }}>
                Gợi ý: {suggestedTags.join(", ")}
              </p>
            )}
          </div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Đang tạo..." : "Tạo tài liệu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDocument;
