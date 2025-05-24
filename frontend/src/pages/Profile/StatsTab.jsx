import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Đăng ký các thành phần Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const StatsTab = ({ scores = [], participatedExams = [], scoreChartData, scoreChartOptions }) => {
  return (
    <div className="stats-tab">
      <div className="stats-section">
        <h2>Thống kê điểm số</h2>
        {scores.length > 0 ? (
          <div className="score-chart">
            <Line data={scoreChartData} options={scoreChartOptions} />
          </div>
        ) : (
          <div className="no-data">
            <p>Chưa có dữ liệu điểm số</p>
          </div>
        )}
      </div>

      <div className="stats-section">
        <h2>Các đề thi đã tham gia</h2>
        {participatedExams.length > 0 ? (
          <div className="exam-list">
            {participatedExams.map((exam) => (
              <div key={exam._id} className="exam-card">
                <div className="exam-info">
                  <h3>{exam.title}</h3>
                  <p className="exam-details">
                    <span>
                      <i className="fas fa-calendar-alt"></i>{" "}
                      {new Date(exam.date).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span>
                      <i className="fas fa-clock"></i> {exam.duration} phút
                    </span>
                    <span>
                      <i className="fas fa-graduation-cap"></i>{" "}
                      {exam.educationLevel === "university"
                        ? "Đại học"
                        : `Lớp ${exam.educationLevel.replace("grade", "")}`}
                    </span>
                  </p>
                  <p className="exam-subject">
                    <i className="fas fa-book"></i> {exam.subject === "math" ? "Toán" : exam.subject}
                  </p>
                </div>
                <div className="exam-score">
                  <div className="score-circle">{exam.score}</div>
                  <span>Điểm</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>Chưa tham gia đề thi nào</p>
          </div>
        )}
      </div>

      <div className="stats-section">
        <h2>Thành tích</h2>
        <div className="achievements">
          {scores.length > 0 ? (
            <div className="achievement-stats">
              <div className="achievement-item">
                <div className="achievement-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="achievement-info">
                  <h3>Điểm trung bình</h3>
                  <p className="achievement-value">
                    {(scores.reduce((sum, score) => sum + score.score, 0) / scores.length).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="achievement-item">
                <div className="achievement-icon">
                  <i className="fas fa-medal"></i>
                </div>
                <div className="achievement-info">
                  <h3>Điểm cao nhất</h3>
                  <p className="achievement-value">{Math.max(...scores.map((score) => score.score))}</p>
                </div>
              </div>
              <div className="achievement-item">
                <div className="achievement-icon">
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <div className="achievement-info">
                  <h3>Số đề thi đã làm</h3>
                  <p className="achievement-value">{participatedExams.length}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>Chưa có thành tích nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatsTab
