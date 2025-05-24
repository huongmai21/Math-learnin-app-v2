"use client"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { unfollowUser } from "../../services/userService"

const FriendsTab = ({
  friendsFilter = "followers",
  setFriendsFilter,
  friendsSearchQuery = "",
  setFriendsSearchQuery,
  followers = [],
  following = [],
}) => {
  const handleUnfollow = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy theo dõi người dùng này?")) return

    try {
      await unfollowUser(userId)
      toast.success("Đã hủy theo dõi!")
      // Reload page to see changes
      window.location.reload()
    } catch (error) {
      toast.error("Không thể hủy theo dõi: " + (error.message || "Vui lòng thử lại."))
    }
  }

  // Lọc danh sách bạn bè
  const currentList = friendsFilter === "followers" ? followers : following
  const filteredFriends = currentList.filter((friend) =>
    friend.username.toLowerCase().includes(friendsSearchQuery.toLowerCase()),
  )

  return (
    <div className="friends-tab">
      <div className="friends-header">
        <h2>Bạn bè</h2>
        <div className="friends-filters">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${friendsFilter === "followers" ? "active" : ""}`}
              onClick={() => setFriendsFilter("followers")}
            >
              Người theo dõi ({followers.length})
            </button>
            <button
              className={`filter-btn ${friendsFilter === "following" ? "active" : ""}`}
              onClick={() => setFriendsFilter("following")}
            >
              Đang theo dõi ({following.length})
            </button>
          </div>
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm bạn bè..."
              value={friendsSearchQuery}
              onChange={(e) => setFriendsSearchQuery(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>
        </div>
      </div>

      <div className="friends-content">
        {filteredFriends.length > 0 ? (
          <div className="friends-list">
            {filteredFriends.map((friend) => (
              <div key={friend._id} className="friend-item">
                <div className="friend-avatar">
                  <img
                    src={friend.avatar || "/placeholder.svg?height=60&width=60"}
                    alt={friend.username}
                    loading="lazy"
                  />
                </div>
                <div className="friend-info">
                  <h3>{friend.username}</h3>
                  <p className="friend-role">
                    {friend.role === "student" ? "Học sinh" : friend.role === "teacher" ? "Giáo viên" : "Quản trị viên"}
                  </p>
                  {friend.bio && <p className="friend-bio">{friend.bio}</p>}
                </div>
                <div className="friend-actions">
                  <Link to={`/users/${friend._id}`} className="view-profile-btn">
                    <i className="fas fa-user"></i> Xem hồ sơ
                  </Link>
                  {friendsFilter === "following" && (
                    <button className="unfollowUser-btn" onClick={() => handleUnfollow(friend._id)}>
                      <i className="fas fa-user-minus"></i> Hủy theo dõi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>{friendsFilter === "followers" ? "Chưa có người theo dõi nào" : "Bạn chưa theo dõi người dùng nào"}</p>
            {friendsFilter === "following" && (
              <div className="no-data-actions">
                <Link to="/users" className="btn-secondary">
                  <i className="fas fa-users"></i> Khám phá người dùng
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FriendsTab
