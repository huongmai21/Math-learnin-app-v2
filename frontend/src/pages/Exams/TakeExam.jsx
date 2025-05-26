import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { submitExam } from "../../services/courseService";
import { getExamById } from "../../services/examService";
import "./TakeExam.css";

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [progressSaved, setProgressSaved] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      toast.error("Vui lòng đăng nhập để làm bài thi!");
      navigate("/auth/login");
      return;
    }

    const fetchExam = async () => {
      setLoading(true);
      try {
        const response = await getExamById(examId);
        setExam(response.data);
      } catch (err) {
        setError(err?.message || "Không thể tải bài thi!");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, user, token, navigate]);

  useEffect(() => {
    if (exam) {
      const now = new Date();
      if (now < new Date(exam.startTime)) {
        setError("Bài thi chưa bắt đầu!");
        return;
      }
      if (now > new Date(exam.endTime)) {
        setError("Bài thi đã kết thúc!");
        return;
      }
    }
  }, [exam]);

  useEffect(() => {
    if (exam) {
      const endTime = new Date(exam.endTime);
      const updateTimer = () => {
        const now = new Date();
        const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeRemaining(timeLeft);
        if (timeLeft === 0) {
          handleSubmit(new Event("submit")); // Tự động nộp bài khi hết thời gian
        }
      };
      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }
  }, [exam]);

  const saveProgress = () => {
    localStorage.setItem(`exam_${examId}_progress`, JSON.stringify(answers));
    setProgressSaved(true);
    toast.success("Đã lưu tiến độ!");
    setTimeout(() => setProgressSaved(false), 2000);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleFileChange = (questionId, file) => {
    setFiles((prev) => ({ ...prev, [questionId]: file }));
  };

  const uploadFileToCloudinary = async (file) => {
    try {
      const presetResponse = await api.get("/cloudinary-upload-preset");
      const { upload_preset, cloud_name } = presetResponse.data;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", upload_preset);
      formData.append("resource_type", "auto");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Lỗi khi upload file");
      }
      return data.secure_url;
    } catch (error) {
      toast.error(error.message || "Không thể upload file");
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm("Bạn có chắc muốn nộp bài?")) return;
    setSubmitting(true);
    try {
      const finalAnswers = { ...answers };
      for (const [questionId, file] of Object.entries(files)) {
        if (file) {
          const fileUrl = await uploadFileToCloudinary(file);
          finalAnswers[questionId] = fileUrl;
        }
      }
      const response = await submitExam(examId, finalAnswers);
      toast.success(
        `Nộp bài thành công! Điểm: ${response.data.score}/${response.data.total}`
      );
      navigate(`/courses/${exam.courseId}`);
    } catch (err) {
      toast.error(err?.message || "Nộp bài thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải bài thi...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!exam) {
    return <div className="no-results">Bài thi không tồn tại.</div>;
  }

  return (
    <div className="take-exam">
      <Helmet>
        <title>FunMath - Làm bài thi: {exam.title}</title>
        <meta
          name="description"
          content={`Làm bài thi ${exam.title} thuộc khóa học.`}
        />
      </Helmet>
      <div className="exam-container">
        <Link to={`/courses/${exam.courseId}`} className="back-link">
          <i className="fas fa-arrow-left"></i> Quay lại khóa học
        </Link>
        <h2>{exam.title}</h2>
        <p>Thời gian: {exam.duration} phút</p>
        {timeRemaining !== null && (
          <p>
            Thời gian còn lại: {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </p>
        )}
        <form onSubmit={handleSubmit} className="exam-form">
          <div className="progress-indicator">
            Đã trả lời: {Object.keys(answers).length}/{exam.questions.length}
          </div>
          {exam.questions.map((question, index) => (
            <div key={question._id} className="question-item">
              <h4>
                Câu {index + 1}: {question.questionText} ({question.score} điểm)
              </h4>
              {question.questionType === "multiple-choice" ? (
                <div className="options">
                  {question.options.map((option, idx) => (
                    <label key={idx} className="option-item">
                      <input
                        type="radio"
                        name={`question-${question._id}`}
                        value={idx}
                        checked={answers[question._id] === idx.toString()}
                        onChange={() =>
                          handleAnswerChange(question._id, idx.toString())
                        }
                      />
                      {option.text}
                    </label>
                  ))}
                </div>
              ) : question.questionType === "true-false" ? (
                <div className="options">
                  <label>
                    <input
                      type="radio"
                      name={`question-${question._id}`}
                      value="true"
                      checked={answers[question._id] === "true"}
                      onChange={() => handleAnswerChange(question._id, "true")}
                    />
                    Đúng
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`question-${question._id}`}
                      value="false"
                      checked={answers[question._id] === "false"}
                      onChange={() => handleAnswerChange(question._id, "false")}
                    />
                    Sai
                  </label>
                </div>
              ) : question.questionType === "fill-in" ? (
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập câu trả lời..."
                  value={answers[question._id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(question._id, e.target.value)
                  }
                />
              ) : (
                <div className="essay-answer">
                  <textarea
                    className="form-textarea"
                    placeholder="Nhập câu trả lời của bạn..."
                    value={answers[question._id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(question._id, e.target.value)
                    }
                  />
                  <div className="file-upload">
                    <label>Tải file (PDF, hình ảnh, v.v.):</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileChange(question._id, e.target.files[0])
                      }
                    />
                    {files[question._id] && (
                      <p>File: {files[question._id].name}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="form-actions">
            <button
              type="button"
              className="save-progress-button"
              onClick={saveProgress}
            >
              {progressSaved ? "Đã lưu!" : "Lưu tạm thời"}
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={submitting}
            >
              {submitting ? "Đang nộp bài..." : "Nộp bài"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TakeExam;
