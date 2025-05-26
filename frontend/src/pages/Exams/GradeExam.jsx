import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { updateSubmissionScore } from "../../services/courseService";
import { getExamById } from "../../services/examService";
import "./GradeExam.css";

const GradeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreDistribution, setScoreDistribution] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    if (!user || !token || (user.role !== "teacher" && user.role !== "admin")) {
      toast.error("Bạn không có quyền chấm bài!");
      navigate("/courses");
      return;
    }

    const fetchExam = async () => {
      setLoading(true);
      try {
        const response = await getExamById(examId);
        setExam(response.data);
        setSubmissions(response.data.submissions || []);
      } catch (err) {
        setError(err?.message || "Không thể tải bài thi!");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, user, token, navigate]);

  useEffect(() => {
  if (submissions.length > 0) {
    const distribution = [0, 0, 0, 0, 0];
    submissions.forEach((submission) => {
      const totalScore = Object.values(submission.answers).reduce(
        (sum, ans) => sum + (ans.score || 0),
        0
      );
      const percentage = (totalScore / exam.totalScore) * 10;
      if (percentage <= 2) distribution[0]++;
      else if (percentage <= 4) distribution[1]++;
      else if (percentage <= 6) distribution[2]++;
      else if (percentage <= 8) distribution[3]++;
      else distribution[4]++;
    });
    setScoreDistribution(distribution);
  }
}, [submissions, exam]);

  const handleGradeChange = (submissionId, questionId, score) => {
    setGrades((prev) => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [questionId]: Number(score) || 0,
      },
    }));
  };

  const handleSubmitGrades = async (submissionId) => {
    try {
      const submissionGrades = grades[submissionId] || {};
      await updateSubmissionScore(examId, submissionId, submissionGrades);
      toast.success("Chấm điểm thành công!");
      const response = await getExamById(examId);
      setSubmissions(response.data.submissions || []);
    } catch (err) {
      toast.error(err?.message || "Chấm điểm thất bại!");
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
    <div className="grade-exam">
      <Helmet>
        <title>FunMath - Chấm bài thi: {exam.title}</title>
        <meta
          name="description"
          content={`Chấm bài thi ${exam.title} cho học viên.`}
        />
      </Helmet>
      <div className="grade-container">
        <Link to={`/courses/${exam.courseId}`} className="back-link">
          <i className="fas fa-arrow-left"></i> Quay lại khóa học
        </Link>
        <h2>Chấm bài thi: {exam.title}</h2>
        {/* <div className="score-distribution">
          <h3>Phân bố điểm số</h3> */}
        {submissions.length > 0 ? (
          submissions.map((submission) => {
            const totalScore = Object.values(grades[submission._id] || {}).reduce(
              (sum, score) => sum + score,
              0
            );

            return (
              <div key={submission._id} className="submission-item">
                <h3>
                  Học viên: {submission.userId?.username || "Ẩn danh"} - Nộp lúc:{" "}
                  {new Date(submission.submittedAt).toLocaleString("vi-VN")}
                </h3>
                {exam.questions
                  .filter((q) => ["essay", "math-equation"].includes(q.questionType))
                  .map((question) => (
                    <div key={question._id} className="question-grade">
                      <p>
                        <strong>Câu hỏi:</strong> {question.questionText} (
                        {question.score} điểm)
                      </p>
                      <p>
                        <strong>Trả lời:</strong>{" "}
                        {submission.answers[question._id]?.answer.startsWith(
                          "http"
                        ) ? (
                          <a
                            href={submission.answers[question._id].answer}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Xem file
                          </a>
                        ) : (
                          submission.answers[question._id]?.answer ||
                          "Không có trả lời"
                        )}
                      </p>
                      <div className="grade-input">
                        <label>Điểm:</label>
                        <input
                          type="number"
                          min="0"
                          max={question.score}
                          value={
                            grades[submission._id]?.[question._id] ||
                            submission.answers[question._id]?.score ||
                            0
                          }
                          onChange={(e) =>
                            handleGradeChange(
                              submission._id,
                              question._id,
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                <p>
                  Tổng điểm: {totalScore}/{exam.totalScore}
                </p>
                <button
                  onClick={() => handleSubmitGrades(submission._id)}
                  className="submit-button"
                >
                  Lưu điểm
                </button>
              </div>
            );
          })
        ) : (
          <p className="no-results">Chưa có bài nộp nào.</p>
        )}
      </div>
    </div>
  );
};

export default GradeExam;