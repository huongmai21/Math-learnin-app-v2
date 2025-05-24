"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import AchievementSystem from "../../components/achievements/AchievementSystem"
import "./AchievementsPage.css"

const AchievementsPage = () => {
  const { user } = useSelector((state) => state.auth)
  const [userLevel, setUserLevel] = useState(1)
  const [userXP, setUserXP] = useState(0)
  const [nextLevelXP, setNextLevelXP] = useState(100)
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    // Giả lập dữ liệu người dùng
    if (user) {
      setUserLevel(user.level || 1)
      setUserXP(user.xp || 0)
      setNextLevelXP(calculateNextLevelXP(user.level || 1))
    }

    // Giả lập dữ liệu bảng xếp hạng
    setLeaderboard([
      {
        id: 1,
        username: "mathgenius",
        avatar: "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png",
        level: 15,
        xp: 3500,
      },
      {
        id: 2,
        username: "algebralover",
        avatar: "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png",
        level: 12,
        xp: 2800,
      },
      {
        id: 3,
        username: "calculusking",
        avatar: "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png",
        level: 10,
        xp: 2200,
      },
      {
        id: 4,
        username: "geometryguru",
        avatar: "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png",
        level: 9,
        xp: 1900,
      },
      {
        id: 5,
        username: "mathwizard",
        avatar: "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png",
        level: 8,
        xp: 1700,
      },
    ])
  }, [user])

  // Tính XP cần thiết cho cấp độ tiếp theo
  const calculateNextLevelXP = (level) => {
    return level * 100
  }

  // Tính phần trăm tiến độ
  const calculateProgress = () => {
    return (userXP / nextLevelXP) * 100
  }

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <h1>Thành tích và cấp độ</h1>
        <p>Hoàn thành các thử thách để mở khóa thành tích và tăng cấp độ!</p>
      </div>

      <div className="achievements-content">
        <div className="user-level-card">
          <div className="user-info">
            <img
              src={
                user?.avatar ||
                "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png" ||
                "/placeholder.svg"
              }
              alt={user?.username || "User"}
              className="user-avatar"
            />
            <div className="user-details">
              <h2>{user?.username || "User"}</h2>
              <div className="level-badge">Cấp {userLevel}</div>
            </div>
          </div>

          <div className="level-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${calculateProgress()}%` }}></div>
            </div>
            <div className="progress-info">
              <span className="current-xp">{userXP} XP</span>
              <span className="next-level">{nextLevelXP} XP</span>
            </div>
          </div>

          <div className="level-stats">
            <div className="stat-item">
              <i className="fas fa-trophy"></i>
              <div className="stat-info">
                <span className="stat-value">12</span>
                <span className="stat-label">Thành tích</span>
              </div>
            </div>
            <div className="stat-item">
              <i className="fas fa-medal"></i>
              <div className="stat-info">
                <span className="stat-value">5</span>
                <span className="stat-label">Huy hiệu</span>
              </div>
            </div>
            <div className="stat-item">
              <i className="fas fa-star"></i>
              <div className="stat-info">
                <span className="stat-value">3</span>
                <span className="stat-label">Thứ hạng</span>
              </div>
            </div>
          </div>
        </div>

        <div className="leaderboard-section">
          <h2>Bảng xếp hạng</h2>
          <div className="leaderboard">
            {leaderboard.map((player, index) => (
              <div key={player.id} className="leaderboard-item">
                <div className="rank">{index + 1}</div>
                <div className="player-info">
                  <img src={player.avatar || "/placeholder.svg"} alt={player.username} className="player-avatar" />
                  <span className="player-name">{player.username}</span>
                </div>
                <div className="player-level">Cấp {player.level}</div>
                <div className="player-xp">{player.xp} XP</div>
              </div>
            ))}
          </div>
          <Link to="/leaderboard" className="view-all-button">
            Xem tất cả <i className="fas fa-chevron-right"></i>
          </Link>
        </div>

        <AchievementSystem />

        <div className="daily-challenges">
          <h2>Thử thách hàng ngày</h2>
          <div className="challenges-list">
            <div className="challenge-card">
              <div className="challenge-icon">
                <i className="fas fa-book"></i>
              </div>
              <div className="challenge-info">
                <h3>Hoàn thành 3 bài tập</h3>
                <div className="challenge-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "66%" }}></div>
                  </div>
                  <span className="progress-text">2/3</span>
                </div>
              </div>
              <div className="challenge-reward">
                <span>+20 XP</span>
              </div>
            </div>
            <div className="challenge-card completed">
              <div className="challenge-icon">
                <i className="fas fa-comments"></i>
              </div>
              <div className="challenge-info">
                <h3>Trả lời 2 câu hỏi</h3>
                <div className="challenge-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "100%" }}></div>
                  </div>
                  <span className="progress-text">2/2</span>
                </div>
              </div>
              <div className="challenge-reward claimed">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
            <div className="challenge-card">
              <div className="challenge-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="challenge-info">
                <h3>Tham gia phòng học nhóm</h3>
                <div className="challenge-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "0%" }}></div>
                  </div>
                  <span className="progress-text">0/1</span>
                </div>
              </div>
              <div className="challenge-reward">
                <span>+15 XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AchievementsPage
