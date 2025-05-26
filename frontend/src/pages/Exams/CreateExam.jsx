import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { createExam } from "../../services/examService";
import { getAllCourses } from "../../services/courseService";
import "./CreateExam.css";

const CreateExam = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
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
    isPublic: true,
    courseId: "",
  });
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    questionType: "multiple-choice",
    options: ["", "", "", ""],
    correctAnswer: "",
    score: 1,
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !token || (user.role !== "teacher" && user.role !== "admin")) {
      toast.error("Bạn không có quyền tạo đề thi!");
      navigate("/exams");
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await getAllCourses();
        setCourses(response.data || []);
      } catch (err) {
        toast.error("Không thể tải danh sách khóa học!");
      }
    };
    fetchCourses();
  }, [user, token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isPublic" ? value === "true" : value,
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setNewQuestion((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const addQuestion = () => {
    if (!newQuestion.questionText) {
      toast.error("Vui lòng nhập nội dung câu hỏi!");
      return;
    }
    if (newQuestion.questionType === "multiple-choice" && !newQuestion.options.every(opt => opt)) {
      toast.error("Vui lòng nhập đầy đủ các lựa chọn!");
      return;
    }
    if (!newQuestion.correctAnswer) {
      toast.error("Vui lòng chọn đáp án đúng!");
      return;
    }
    setQuestions((prev) => [...prev, { ...newQuestion, id: Date.now() }]);
    setNewQuestion({
      questionText: "",
      questionType: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      score: 1,
    });
  };

  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      toast.error("Vui lòng thêm ít nhất một câu hỏi!");
      return;
    }
    setLoading(true);
    try {
      const examData = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        questions,
      };
      await createExam(examData);
      toast.success("Tạo đề thi thành công!");
      navigate("/exams");
    } catch (err) {
      setError(err?.message || "Tạo đề thi thất bại!");
      toast.error(err?.message || "Tạo đề thi thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="create-exam">
      <Helmet>
        <title>FunMath - Tạo đề thi mới</title>
        <meta name="description" content="Tạo đề thi mới cho học sinh hoặc khóa học." />
      </Helmet>
      <div className="exam-container">
        <Link to="/exams" className="back-link">
          <i className="fas fa-arrow-left"></i> Quay lại danh sách đề thi
        </Link>
        <h2>Tạo đề thi mới</h2>
        <form onSubmit={handleSubmit} className="exam-form">
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
          <div className="form-group">
            <label>Loại đề thi</label>
            <select
              name="isPublic"
              value={formData.isPublic}
              onChange={handleInputChange}
            >
              <option value={true}>Công khai</option>
              <option value={false}>Dành cho khóa học</option>
            </select>
          </div>
          {!formData.isPublic && (
            <div className="form-group">
              <label>Chọn khóa học</label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                required={!formData.isPublic}
              >
                <option value="">Chọn khóa học</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="question-section">
            <h3>Thêm câu hỏi</h3>
            <div className="question-form">
              <div className="form-group">
                <label>Nội dung câu hỏi</label>
                <textarea
                  name="questionText"
                  value={newQuestion.questionText}
                  onChange={handleQuestionChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Loại câu hỏi</label>
                <select
                  name="questionType"
                  value={newQuestion.questionType}
                  onChange={handleQuestionChange}
                >
                  <option value="multiple-choice">Trắc nghiệm</option>
                  <option value="true-false">Đúng/Sai</option>
                  <option value="fill-in">Điền vào chỗ trống</option>
                  <option value="essay">Tự luận</option>
                </select>
              </div>
              {newQuestion.questionType === "multiple-choice" && (
                <div className="form-group">
                  <label>Lựa chọn</label>
                  {newQuestion.options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Lựa chọn ${index + 1}`}
                      required
                    />
                  ))}
                </div>
              )}
              <div className="form-group">
                <label>Đáp án đúng</label>
                {newQuestion.questionType === "multiple-choice" ? (
                  <select
                    name="correctAnswer"
                    value={newQuestion.correctAnswer}
                    onChange={handleQuestionChange}
                  >
                    <option value="">Chọn đáp án đúng</option>
                    {newQuestion.options.map((_, index) => (
                      <option key={index} value={index}>
                        Lựa chọn {index + 1}
                      </option>
                    ))}
                  </select>
                ) : newQuestion.questionType === "true-false" ? (
                  <select
                    name="correctAnswer"
                    value={newQuestion.correctAnswer}
                    onChange={handleQuestionChange}
                  >
                    <option value="">Chọn đáp án đúng</option>
                    <option value="true">Đúng</option>
                    <option value="false">Sai</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    name="correctAnswer"
                    value={newQuestion.correctAnswer}
                    onChange={handleQuestionChange}
                    required
                  />
                )}
              </div>
              <div className="form-group">
                <label>Điểm</label>
                <input
                  type="number"
                  name="score"
                  value={newQuestion.score}
                  onChange={handleQuestionChange}
                  min="1"
                  required
                />
              </div>
              <button
                type="button"
                className="add-question-button"
                onClick={addQuestion}
              >
                Thêm câu hỏi
              </button>
            </div>
            <div className="question-list">
              {questions.map((question, index) => (
                <div key={question.id} className="question-item">
                  <h4>Câu {index + 1}: {question.questionText}</h4>
                  <p>Loại: {question.questionType === "multiple-choice" ? "Trắc nghiệm" : 
                            question.questionType === "true-false" ? "Đúng/Sai" : 
                            question.questionType === "fill-in" ? "Điền vào chỗ trống" : "Tự luận"}</p>
                  {question.questionType === "multiple-choice" && (
                    <ul>
                      {question.options.map((opt, i) => (
                        <li key={i}>{opt} {question.correctAnswer == i && "(Đúng)"}</li>
                      ))}
                    </ul>
                  )}
                  {question.questionType !== "multiple-choice" && (
                    <p>Đáp án đúng: {question.correctAnswer}</p>
                  )}
                  <p>Điểm: {question.score}</p>
                  <button
                    type="button"
                    className="remove-question-button"
                    onClick={() => removeQuestion(question.id)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo đề thi"}
            </button>
            <Link to="/exams" className="cancel-button">
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
