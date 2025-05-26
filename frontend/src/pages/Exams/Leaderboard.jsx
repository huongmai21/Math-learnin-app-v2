
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { getGlobalLeaderboard, getExamLeaderboard } from "../../services/examService";
import "./Leaderboard.css";

const Leaderboard = () => {
  const { examId } = useParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeRange, setTimeRange] = useState("all");
  const limit = 10;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const params = { page, limit, timeRange };
        const response = examId
          ? await getExamLeaderboard(examId, params)
          : await getGlobalLeaderboard(params);
        setLeaderboard(response.data);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError(err.message || "Không thể tải bảng xếp hạng!");
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchLeaderboard();
    else toast.error("Vui lòng đăng nhập để xem bảng xếp hạng!");
  }, [isAuthenticated, examId, page, timeRange]);

  const handleImageError = (e) => {
    e.target.src = "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png";
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="leaderboard">
      <Helmet>
        <title>FunMath - {examId ? "Bảng xếp hạng bài thi" : "Bảng xếp hạng toàn cầu"}</title>
        <meta name="description" content="Xem bảng xếp hạng thành tích học tập trên FunMath." />
      </Helmet>
      <div className="leaderboard-container">
        <h2>{examId ? "Bảng xếp hạng bài thi" : "Bảng xếp hạng toàn cầu"}</h2>
        <div className="filter-container">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="time-filter">
            <option value="all">Tất cả</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
          </select>
        </div>
        {leaderboard.length > 0 ? (
          <>
            <div className="leaderboard-list">
              {leaderboard.map((entry) => (
                <motion.div
                  key={entry.user._id}
                  className="leaderboard-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="rank">{entry.rank}</span>
                  <img
                    src={entry.user.avatar || "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png"}
                    alt={entry.user.username}
                    className="avatar"
                    onError={handleImageError}
                  />
                  <span className="username">{entry.user.username}</span>
                  <span className="score">{entry.score} điểm</span>
                  <span className="submitted-at">
                    {new Date(entry.submittedAt).toLocaleString("vi-VN")}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={page === i + 1 ? "active" : ""}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="no-results">Chưa có dữ liệu xếp hạng.</p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;