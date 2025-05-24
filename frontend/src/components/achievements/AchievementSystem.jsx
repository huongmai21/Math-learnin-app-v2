"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import { getUserAchievements, claimAchievementReward } from "../../services/achievementService"
import "./AchievementSystem.css"

const AchievementSystem = () => {
  const { user } = useSelector((state) => state.auth)
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewAchievement, setShowNewAchievement] = useState(false)
  const [newAchievement, setNewAchievement] = useState(null)
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true)
        const response = await getUserAchievements(user._id)
        setAchievements(response.achievements || [])

        // Kiểm tra xem có thành tích mới không
        const newUnlockedAchievement = response.achievements?.find(
          (achievement) => achievement.unlocked && !achievement.seen,
        )

        if (newUnlockedAchievement) {
          setNewAchievement(newUnlockedAchievement)
          setShowNewAchievement(true)

          // Đánh dấu thành tích đã xem
          setTimeout(() => {
            setShowNewAchievement(false)
          }, 5000)
        }
      } catch (error) {
        console.error("Error fetching achievements:", error)
        toast.error("Không thể tải thành tích. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    if (user?._id) {
      fetchAchievements()
    }
  }, [user])

  const handleClaimReward = async (achievementId) => {
    try {
      const response = await claimAchievementReward(achievementId)

      // Cập nhật danh sách thành tích
      setAchievements(
        achievements.map((achievement) =>
          achievement._id === achievementId ? { ...achievement, claimed: true } : achievement,
        ),
      )

      toast.success(`Đã nhận ${response.reward.type === "xp" ? `${response.reward.amount} XP` : response.reward.name}!`)
    } catch (error) {
      console.error("Error claiming reward:", error)
      toast.error("Không thể nhận phần thưởng. Vui lòng thử lại sau.")
    }
  }

  const handleDismissNewAchievement = () => {
    setShowNewAchievement(false)
  }

  const filteredAchievements = achievements.filter((achievement) => {
    if (activeCategory === "all") return true
    if (activeCategory === "unlocked") return achievement.unlocked
    if (activeCategory === "locked") return !achievement.unlocked
    return achievement.category === activeCategory
  })

  const categories = [
    { id: "all", name: "Tất cả", icon: "fa-trophy" },
    { id: "unlocked", name: "Đã mở khóa", icon: "fa-unlock" },
    { id: "locked", name: "Chưa mở khóa", icon: "fa-lock" },
    { id: "learning", name: "Học tập", icon: "fa-graduation-cap" },
    { id: "social", name: "Xã hội", icon: "fa-users" },
    { id: "challenge", name: "Thử thách", icon: "fa-fire" },
  ]

  return (
    <div className="achievement-system">
      {showNewAchievement && newAchievement && (
        <div className="new-achievement-popup">
          <div className="new-achievement-content">
            <div className="achievement-icon">
              <i className={`fas ${newAchievement.icon}`}></i>
            </div>
            <div className="achievement-info">
              <h3>Thành tích mới!</h3>
              <h4>{newAchievement.name}</h4>
              <p>{newAchievement.description}</p>
            </div>
            <button className="dismiss-button" onClick={handleDismissNewAchievement}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      <div className="achievement-header">
        <h2>Thành tích và huy hiệu</h2>
        <p>Hoàn thành các thử thách để mở khóa thành tích và nhận phần thưởng!</p>
      </div>

      <div className="achievement-categories">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-button ${activeCategory === category.id ? "active" : ""}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <i className={`fas ${category.icon}`}></i>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-achievements">
          <div className="spinner"></div>
          <p>Đang tải thành tích...</p>
        </div>
      ) : filteredAchievements.length > 0 ? (
        <div className="achievements-grid">
          {filteredAchievements.map((achievement) => (
            <div key={achievement._id} className={`achievement-card ${achievement.unlocked ? "unlocked" : "locked"}`}>
              <div className="achievement-card-content">
                <div className="achievement-icon">
                  <i className={`fas ${achievement.icon}`}></i>
                </div>
                <h3>{achievement.name}</h3>
                <p>{achievement.description}</p>
                <div className="achievement-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min((achievement.currentProgress / achievement.targetProgress) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {achievement.currentProgress}/{achievement.targetProgress}
                  </span>
                </div>
                {achievement.unlocked && achievement.reward && !achievement.claimed && (
                  <button className="claim-reward-button" onClick={() => handleClaimReward(achievement._id)}>
                    <i className="fas fa-gift"></i> Nhận thưởng
                  </button>
                )}
                {achievement.unlocked && achievement.claimed && (
                  <div className="reward-claimed">
                    <i className="fas fa-check-circle"></i> Đã nhận thưởng
                  </div>
                )}
              </div>
              {!achievement.unlocked && (
                <div className="locked-overlay">
                  <i className="fas fa-lock"></i>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-achievements">
          <i className="fas fa-trophy"></i>
          <p>Không tìm thấy thành tích nào.</p>
        </div>
      )}
    </div>
  )
}

export default AchievementSystem
