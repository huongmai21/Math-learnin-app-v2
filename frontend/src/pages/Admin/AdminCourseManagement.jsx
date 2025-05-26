import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  approveCourse,
  rejectCourse,
  getExamsByCourse,
  createExamForCourse,
  addCourseContent,
  updateCourseContent,
  deleteCourseContent,
} from "../../services/courseService";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import "./AdminCourseManagement.css";

const AdminCourseManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    thumbnail: null,
    category: "grade1",
  });
  const [filter, setFilter] = useState({
    page: 1,
    limit: 10,
    status: "",
    search: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("course");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [showExamForm, setShowExamForm] = useState(false);
  const [examFormData, setExamFormData] = useState({
    title: "",
    description: "",
    educationLevel: "primary",
    subject: "",
    duration: 60,
    questions: [],
    startTime: "",
    endTime: "",
    difficulty: "easy",
    maxAttempts: 1,
  });
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionFormData, setQuestionFormData] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    type: "multiple-choice",
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [contents, setContents] = useState([]);
  const [showContentForm, setShowContentForm] = useState(false);
  const [contentFormData, setContentFormData] = useState({
    title: "",
    type: "video",
    url: "",
    isPreview: false,
    platform: "cloudinary",
  });
  const [editingContentId, setEditingContentId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const fetchCourses = async () => {
    try {
      const response = await getAllCourses(filter);
      setCourses(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      toast.error("Không thể lấy danh sách khóa học");
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      const fetchContents = async () => {
        try {
          const response = await getCourse(selectedCourse);
          setContents(response.data.contents || []);
        } catch (error) {
          toast.error("Không thể lấy danh sách nội dung");
        }
      };
      fetchContents();
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedCourse) {
      const fetchExams = async () => {
        try {
          const response = await getExamsByCourse(selectedCourse);
          setExams(response.data || []);
        } catch (error) {
          toast.error("Không thể lấy danh sách bài thi");
        }
      };
      fetchExams();
    }
  }, [selectedCourse]);

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
      const courseData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        thumbnail: formData.thumbnail,
        category: formData.category,
      };

      if (editingId) {
        await updateCourse(editingId, courseData);
        toast.success("Cập nhật khóa học thành công!");
        setEditingId(null);
      } else {
        // await createCourse(courseData, courses.instructorId);
        await createCourse({ ...courseData, instructorId: user._id });
        toast.success("Tạo khóa học thành công!");
      }
      setFormData({
        title: "",
        description: "",
        price: 0,
        thumbnail: null,
        category: "grade1",
      });
      setShowForm(false);
      fetchCourses();
    } catch (error) {
      toast.error(error.message || "Lỗi khi xử lý khóa học");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    setEditingId(course._id);
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      thumbnail: null,
      category: course.category,
    });
    setShowForm(true);
    setTimeout(() => {
      const formElement = document.querySelector(".create-course-form");
      if (formElement) formElement.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa khóa học này?")) {
      try {
        await deleteCourse(id);
        toast.success("Xóa khóa học thành công!");
        fetchCourses();
      } catch (error) {
        toast.error(error.message || "Lỗi khi xóa khóa học");
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveCourse(id);
      toast.success("Duyệt khóa học thành công!");
      fetchCourses();
    } catch (error) {
      toast.error(error.message || "Lỗi khi duyệt khóa học");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectCourse(id);
      toast.success("Từ chối khóa học thành công!");
      fetchCourses();
    } catch (error) {
      toast.error(error.message || "Lỗi khi từ chối khóa học");
    }
  };

  const handleExamInputChange = (e) => {
    const { name, value } = e.target;
    setExamFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    try {
      await createExamForCourse(selectedCourse, examFormData);
      toast.success("Tạo bài thi thành công!");
      setShowExamForm(false);
      setExamFormData({
        title: "",
        description: "",
        educationLevel: "primary",
        subject: "",
        duration: 60,
        questions: [],
        startTime: "",
        endTime: "",
        difficulty: "easy",
        maxAttempts: 1,
      });
      const response = await getExamsByCourse(selectedCourse);
      setExams(response.data || []);
    } catch (error) {
      toast.error(error.message || "Lỗi khi tạo bài thi");
    }
  };

  const handleContentInputChange = (e) => {
    const { name, value, type: inputType, files, checked } = e.target;
    if (name === "file" && files && files[0]) {
      const file = files[0];
      setContentFormData((prev) => ({
        ...prev,
        [name]: file,
        url: URL.createObjectURL(file), // Tạm thời dùng URL để preview
      }));
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setContentFormData((prev) => ({
        ...prev,
        [name]: inputType === "checkbox" ? checked : value,
      }));
    }
  };

  const handleContentSubmit = async (e) => {
    e.preventDefault();
    try {
      let contentData = { ...contentFormData };
      if (
        contentFormData.platform === "cloudinary" &&
        e.target.file?.files[0]
      ) {
        const videoUrl = await uploadVideoToCloudinary(e.target.file.files[0]);
        contentData.url = videoUrl;
      } else if (contentFormData.platform === "youtube") {
        const youtubeRegex =
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = contentFormData.url.match(youtubeRegex);
        if (match) {
          contentData.url = `https://www.youtube.com/embed/${match[1]}`;
        } else {
          throw new Error("URL YouTube không hợp lệ");
        }
      }
      if (editingContentId) {
        await updateCourseContent(
          selectedCourse,
          editingContentId,
          contentData
        );
        toast.success("Cập nhật nội dung thành công!");
      } else {
        await addCourseContent(selectedCourse, contentData);
        toast.success("Thêm nội dung thành công!");
      }
      setShowContentForm(false);
      setEditingContentId(null);
      setContentFormData({
        title: "",
        type: "video",
        url: "",
        isPreview: false,
        platform: "cloudinary",
      });
      setVideoPreview(null);
      const response = await getCourse(selectedCourse);
      setContents(response.data.contents || []);
    } catch (error) {
      toast.error(error.message || "Lỗi khi xử lý nội dung");
    }
  };

  const handleContentEdit = (content) => {
    setEditingContentId(content._id);
    setContentFormData({
      title: content.title,
      type: content.type,
      url: content.url,
      isPreview: content.isPreview,
      platform: content.platform || "cloudinary",
    });
    setShowContentForm(true);
  };

  const handleContentDelete = async (contentId) => {
    if (window.confirm("Bạn có chắc muốn xóa nội dung này?")) {
      try {
        await deleteCourseContent(selectedCourse, contentId);
        toast.success("Xóa nội dung thành công!");
        const response = await getCourse(selectedCourse);
        setContents(response.data.contents || []);
      } catch (error) {
        toast.error(error.message || "Lỗi khi xóa nội dung");
      }
    }
  };

  const handleQuestionInputChange = (e, index = null) => {
    const { name, value } = e.target;
    if (name === "options") {
      const newOptions = [...questionFormData.options];
      newOptions[index] = value;
      setQuestionFormData((prev) => ({ ...prev, options: newOptions }));
    } else if (name === "score") {
      setQuestionFormData((prev) => ({ ...prev, [name]: Number(value) || 1 }));
    } else {
      setQuestionFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        questionText: questionFormData.questionText,
        options: questionFormData.options,
        correctAnswer: Number(questionFormData.correctAnswer),
        type: questionFormData.type,
        score: Number(questionFormData.score) || 1, // Đảm bảo điểm số có giá trị
      };
      if (editingQuestionId) {
        await updateQuestionInExam(
          selectedExam,
          editingQuestionId,
          questionData
        );
        toast.success("Cập nhật câu hỏi thành công!");
      } else {
        await addQuestionToExam(selectedExam, questionData);
        toast.success("Thêm câu hỏi thành công!");
      }
      setShowQuestionForm(false);
      setEditingQuestionId(null);
      setQuestionFormData({
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        type: "multiple-choice",
        score: 1,
      });
      const response = await getExamsByCourse(selectedCourse);
      const updatedExam = response.data.find(
        (exam) => exam._id === selectedExam
      );
      setQuestions(updatedExam?.questions || []);
    } catch (error) {
      toast.error(error.message || "Lỗi khi xử lý câu hỏi");
    }
  };

  const handleQuestionEdit = (question) => {
    setEditingQuestionId(question._id);
    setQuestionFormData({
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      type: question.type,
    });
    setShowQuestionForm(true);
  };

  const handleQuestionDelete = async (questionId) => {
    if (window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) {
      try {
        await deleteQuestionFromExam(selectedExam, questionId);
        toast.success("Xóa câu hỏi thành công!");
        const response = await getExamsByCourse(selectedCourse);
        const updatedExam = response.data.find(
          (exam) => exam._id === selectedExam
        );
        setQuestions(updatedExam?.questions || []);
      } catch (error) {
        toast.error(error.message || "Lỗi khi xóa câu hỏi");
      }
    }
  };

  const uploadVideoToCloudinary = async (file) => {
    setUploading(true);
    try {
      // Lấy upload preset từ server
      const presetResponse = await api.get("/cloudinary-upload-preset");
      const { upload_preset, cloud_name } = presetResponse.data;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", upload_preset);
      formData.append("resource_type", "video");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Lỗi khi upload video");
      }
      return data.secure_url;
    } catch (error) {
      toast.error(error.message || "Không thể upload video");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="admin-course-management-container">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        tabs="admin"
      />
      <div className="admin-content">
        <h1 className="section-title">Quản lý khóa học</h1>
        <div className="search-section">
          <SearchBar
            placeholder="Tìm kiếm khóa học..."
            onSearch={handleSearch}
            className="admin-search-bar"
          />
        </div>
        <div className="filter-section">
          <div className="form-group">
            <label>Trạng thái</label>
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Bị từ chối</option>
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
              price: 0,
              thumbnail: null,
              category: "grade1",
            });
          }}
        >
          Thêm khóa học
        </button>
        {showForm && (
          <div className="create-course-form">
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
                <label>Giá (VND)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Danh mục</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="grade1">Cấp 1</option>
                  <option value="grade2">Cấp 2</option>
                  <option value="grade3">Cấp 3</option>
                  <option value="university">Đại học</option>
                </select>
              </div>
              <div className="form-group">
                <label>Hình thu nhỏ</label>
                <input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {editingId ? "Cập nhật khóa học" : "Tạo khóa học"}
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
        <div className="courses-section">
          <h2 className="section-title">Danh sách khóa học</h2>
          <div className="course-grid">
            {courses.map((course) => (
              <div key={course._id} className="course-card">
                <div className="course-thumbnail">
                  <img
                    src={
                      course.thumbnail ||
                      "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png"
                    }
                    alt={course.title}
                  />
                </div>
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p className="course-description">
                    {course.description?.slice(0, 100)}...
                  </p>
                  <div className="course-meta">
                    <span>
                      Giá:{" "}
                      {course.price > 0 ? `${course.price} VND` : "Miễn phí"}
                    </span>
                    <span>
                      Trạng thái:{" "}
                      {course.status === "pending"
                        ? "Chờ duyệt"
                        : course.status === "approved"
                        ? "Đã duyệt"
                        : "Bị từ chối"}
                    </span>
                    <span>
                      Giảng viên:{" "}
                      {course.instructorId?.username || "Chưa có thông tin"}
                    </span>
                  </div>
                </div>
                <div className="course-actions-row">
                  <button
                    onClick={() => handleEdit(course)}
                    className="download-button"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="bookmark-button"
                  >
                    Xóa
                  </button>
                  {course.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(course._id)}
                        className="approve-button"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(course._id)}
                        className="reject-button"
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedCourse(course._id)}
                    className="download-button"
                  >
                    Quản lý bài thi
                  </button>
                </div>

                {selectedCourse === course._id && (
                  <div className="exams-section">
                    <h3>Danh sách bài thi</h3>
                    <button
                      onClick={() => setShowExamForm(true)}
                      className="submit-button"
                    >
                      Thêm bài thi
                    </button>
                    {showExamForm && (
                      <div className="create-exam-form">
                        <form onSubmit={handleExamSubmit}>
                          <div className="form-group">
                            <label>Tiêu đề</label>
                            <input
                              type="text"
                              name="title"
                              value={examFormData.title}
                              onChange={handleExamInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Mô tả</label>
                            <textarea
                              name="description"
                              value={examFormData.description}
                              onChange={handleExamInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label>Cấp học</label>
                            <select
                              name="educationLevel"
                              value={examFormData.educationLevel}
                              onChange={handleExamInputChange}
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
                              value={examFormData.subject}
                              onChange={handleExamInputChange}
                              // required
                            >
                              <option value="">Chọn môn học</option>
                              <option value="advanced_math">
                                Toán Nâng Cao
                              </option>
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
                          <div className="form-group">
                            <label>Thời gian (phút)</label>
                            <input
                              type="number"
                              name="duration"
                              value={examFormData.duration}
                              onChange={handleExamInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Thời gian bắt đầu</label>
                            <input
                              type="datetime-local"
                              name="startTime"
                              value={examFormData.startTime}
                              onChange={handleExamInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Thời gian kết thúc</label>
                            <input
                              type="datetime-local"
                              name="endTime"
                              value={examFormData.endTime}
                              onChange={handleExamInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Độ khó</label>
                            <select
                              name="difficulty"
                              value={examFormData.difficulty}
                              onChange={handleExamInputChange}
                            >
                              <option value="easy">Dễ</option>
                              <option value="medium">Trung bình</option>
                              <option value="hard">Khó</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Số lần làm tối đa</label>
                            <input
                              type="number"
                              name="maxAttempts"
                              value={examFormData.maxAttempts}
                              onChange={handleExamInputChange}
                              min="1"
                              required
                            />
                          </div>
                          <div className="form-actions">
                            <button type="submit" className="submit-button">
                              Tạo bài thi
                            </button>
                            <button
                              type="button"
                              className="bookmark-button"
                              onClick={() => setShowExamForm(false)}
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    <div className="exam-list">
                      {exams.map((exam) => (
                        <div key={exam._id} className="exam-card">
                          <h4>{exam.title}</h4>
                          <p>Độ khó: {exam.difficulty}</p>
                          <p>Thời gian: {exam.duration} phút</p>
                          <p>
                            Bắt đầu: {new Date(exam.startTime).toLocaleString()}
                          </p>
                          <p>
                            Kết thúc: {new Date(exam.endTime).toLocaleString()}
                          </p>
                          <button
                            onClick={() => {
                              setSelectedExam(exam._id);
                              setQuestions(exam.questions || []);
                            }}
                            className="download-button"
                          >
                            Quản lý câu hỏi
                          </button>
                          {selectedExam === exam._id && (
                            <div className="questions-section">
                              <h4>Danh sách câu hỏi</h4>
                              <button
                                onClick={() => setShowQuestionForm(true)}
                                className="submit-button"
                              >
                                Thêm câu hỏi
                              </button>
                              {showQuestionForm && (
                                <div className="create-question-form">
                                  <form onSubmit={handleQuestionSubmit}>
                                    <div className="form-group">
                                      <label>Câu hỏi</label>
                                      <textarea
                                        name="questionText"
                                        value={questionFormData.questionText}
                                        onChange={handleQuestionInputChange}
                                        required
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Loại câu hỏi</label>
                                      <select
                                        name="type"
                                        value={questionFormData.type}
                                        onChange={handleQuestionInputChange}
                                      >
                                        <option value="multiple-choice">
                                          Trắc nghiệm
                                        </option>
                                        <option value="text">Tự luận</option>
                                      </select>
                                    </div>
                                    {questionFormData.type ===
                                      "multiple-choice" && (
                                      <>
                                        <div className="form-group">
                                          <label>Tùy chọn</label>
                                          {questionFormData.options.map(
                                            (option, index) => (
                                              <input
                                                key={index}
                                                type="text"
                                                name="options"
                                                value={option}
                                                onChange={(e) =>
                                                  handleQuestionInputChange(
                                                    e,
                                                    index
                                                  )
                                                }
                                                placeholder={`Tùy chọn ${
                                                  index + 1
                                                }`}
                                                required
                                              />
                                            )
                                          )}
                                        </div>
                                        <div className="form-group">
                                          <label>
                                            Đáp án đúng (chỉ số tùy chọn)
                                          </label>
                                          <select
                                            name="correctAnswer"
                                            value={
                                              questionFormData.correctAnswer
                                            }
                                            onChange={handleQuestionInputChange}
                                            required
                                          >
                                            {questionFormData.options.map(
                                              (_, index) => (
                                                <option
                                                  key={index}
                                                  value={index}
                                                >
                                                  {index}
                                                </option>
                                              )
                                            )}
                                          </select>
                                        </div>
                                      </>
                                    )}
                                    <div className="form-group">
                                      <label>Điểm số</label>
                                      <input
                                        type="number"
                                        name="score"
                                        value={questionFormData.score}
                                        onChange={handleQuestionInputChange}
                                        min="1"
                                        required
                                      />
                                    </div>
                                    <div className="form-actions">
                                      <button
                                        type="submit"
                                        className="submit-button"
                                      >
                                        {editingQuestionId
                                          ? "Cập nhật câu hỏi"
                                          : "Thêm câu hỏi"}
                                      </button>
                                      <button
                                        type="button"
                                        className="bookmark-button"
                                        onClick={() =>
                                          setShowQuestionForm(false)
                                        }
                                      >
                                        Hủy
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              )}
                              <div className="question-list">
                                {questions.map((question) => (
                                  <div className="question-card">
                                    <p>{question.questionText}</p>
                                    {question.type === "multiple-choice" && (
                                      <ul>
                                        {question.options.map(
                                          (option, index) => (
                                            <li key={index}>
                                              {option}{" "}
                                              {index ===
                                                question.correctAnswer &&
                                                "(Đáp án đúng)"}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    )}
                                    <p>Điểm: {question.score}</p>
                                    <div className="question-actions">
                                      <button
                                        onClick={() =>
                                          handleQuestionEdit(question)
                                        }
                                        className="download-button"
                                      >
                                        Sửa
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleQuestionDelete(question._id)
                                        }
                                        className="bookmark-button"
                                      >
                                        Xóa
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="contents-section">
                  <h3>Quản lý nội dung khóa học</h3>
                  <button
                    onClick={() => {
                      setSelectedCourse(course._id);
                      setShowContentForm(true);
                      setEditingContentId(null);
                      setContentFormData({
                        title: "",
                        type: "video",
                        url: "",
                        isPreview: false,
                        platform: "cloudinary",
                      });
                    }}
                    className="submit-button"
                  >
                    Thêm nội dung
                  </button>
                  {showContentForm && (
                    <div className="create-content-form">
                      <form onSubmit={handleContentSubmit}>
                        <div className="form-group">
                          <label>Tiêu đề</label>
                          <input
                            type="text"
                            name="title"
                            value={contentFormData.title}
                            onChange={handleContentInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Loại nội dung</label>
                          <select
                            name="type"
                            value={contentFormData.type}
                            onChange={handleContentInputChange}
                          >
                            <option value="video">Video</option>
                            <option value="document">Tài liệu</option>
                            <option value="quiz">Bài kiểm tra</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Nguồn</label>
                          <select
                            name="platform"
                            value={contentFormData.platform}
                            onChange={handleContentInputChange}
                          >
                            <option value="cloudinary">Cloudinary</option>
                            <option value="youtube">YouTube</option>
                          </select>
                        </div>
                        {contentFormData.platform === "cloudinary" &&
                        contentFormData.type === "video" ? (
                          <div className="form-group">
                            <label>Upload video</label>
                            <input
                              type="file"
                              name="file"
                              accept="video/*"
                              onChange={handleContentInputChange}
                              disabled={uploading}
                            />
                            {videoPreview && (
                              <div className="video-preview">
                                <video width="100%" height="150" controls>
                                  <source src={videoPreview} type="video/mp4" />
                                  Trình duyệt không hỗ trợ video.
                                </video>
                                <button
                                  type="button"
                                  className="bookmark-button"
                                  onClick={() => {
                                    setVideoPreview(null);
                                    setContentFormData((prev) => ({
                                      ...prev,
                                      url: "",
                                    }));
                                  }}
                                >
                                  Xóa preview
                                </button>
                              </div>
                            )}
                            {uploading && <p>Đang upload...</p>}
                          </div>
                        ) : (
                          <div className="form-group">
                            <label>URL nội dung</label>
                            <input
                              type="text"
                              name="url"
                              value={contentFormData.url}
                              onChange={handleContentInputChange}
                              required
                            />
                          </div>
                        )}
                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              name="isPreview"
                              checked={contentFormData.isPreview}
                              onChange={handleContentInputChange}
                            />
                            Cho phép xem trước
                          </label>
                        </div>
                        <div className="form-actions">
                          <button
                            type="submit"
                            className="submit-button"
                            disabled={uploading}
                          >
                            {editingContentId
                              ? "Cập nhật nội dung"
                              : "Thêm nội dung"}
                          </button>
                          <button
                            type="button"
                            className="bookmark-button"
                            onClick={() => {
                              setShowContentForm(false);
                              setVideoPreview(null);
                            }}
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  <div className="content-list">
                    {contents.map((content) => (
                      <div key={content._id} className="content-card">
                        <h4>{content.title}</h4>
                        <p>Loại: {content.type}</p>
                        <p>Nguồn: {content.platform || "Cloudinary"}</p>
                        {content.type === "video" && (
                          <div className="video-preview">
                            {content.platform === "youtube" ? (
                              <iframe
                                width="100%"
                                height="150"
                                src={content.url}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : (
                              <video width="100%" height="150" controls>
                                <source src={content.url} type="video/mp4" />
                                Trình duyệt không hỗ trợ video.
                              </video>
                            )}
                          </div>
                        )}
                        <div className="content-actions">
                          <button
                            onClick={() => handleContentEdit(content)}
                            className="download-button"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleContentDelete(content._id)}
                            className="bookmark-button"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
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

export default AdminCourseManagement;
