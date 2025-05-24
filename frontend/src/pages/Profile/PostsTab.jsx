"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { createPost, deletePost } from "../../services/postService"

const PostsTab = ({ posts = [], notifications = [], handleMarkNotificationRead, unreadNotificationsCount = 0 }) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    type: "question", // question, discussion, resource
    tags: [],
  })
  const [tagInput, setTagInput] = useState("")

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newPost.title || !newPost.content) {
      toast.error("Vui lòng nhập tiêu đề và nội dung bài đăng")
      return
    }

    try {
      await createPost(newPost)
      toast.success("Tạo bài đăng thành công!")
      setNewPost({
        title: "",
        content: "",
        type: "question",
        tags: [],
      })
      setTagInput("")
      // Reload page to see changes
      window.location.reload()
    } catch (error) {
      toast.error("Không thể tạo bài đăng: " + (error.message || "Vui lòng thử lại."))
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) return

    try {
      await deletePost(postId)
      toast.success("Đã xóa bài đăng!")
      // Reload page to see changes
      window.location.reload()
    } catch (error) {
      toast.error("Không thể xóa bài đăng: " + (error.message || "Vui lòng thử lại."))
    }
  }

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      if (!newPost.tags.includes(tagInput.trim())) {
        setNewPost({
          ...newPost,
          tags: [...newPost.tags, tagInput.trim()],
        })
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag) => {
    setNewPost({
      ...newPost,
      tags: newPost.tags.filter((t) => t !== tag),
    })
  }

  return (
    <div className="posts-tab">
      <div className="posts-header">
        <h2>Học tập</h2>
        <div className="posts-actions">
          <div className="notifications-badge">
            <button
              className="notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Thông báo"
            >
              <i className="fas fa-bell"></i>
              {unreadNotificationsCount > 0 && <span className="badge">{unreadNotificationsCount}</span>}
            </button>
            {showNotifications && (
              <div className="notifications-dropdown">
                <h3>Thông báo</h3>
                {notifications.length > 0 ? (
                  <div className="notifications-list">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`notification-item ${notification.isRead ? "" : "unread"}`}
                        onClick={() => {
                          if (!notification.isRead) {
                            handleMarkNotificationRead(notification._id)
                          }
                          window.location.href = notification.link || "#"
                        }}
                      >
                        <p>{notification.message}</p>
                        <span className="notification-time">
                          {new Date(notification.createdAt).toLocaleDateString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "numeric",
                            month: "numeric",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-notifications">Không có thông báo nào</div>
                )}
              </div>
            )}
          </div>
          <Link to="/study-corner" className="btn-primary">
            <i className="fas fa-comments"></i> Đến góc học tập
          </Link>
        </div>
      </div>

      <div className="create-post-section">
        <h3>Tạo bài đăng mới</h3>
        <form onSubmit={handleCreatePost}>
          <div className="form-group">
            <label htmlFor="post-title">Tiêu đề</label>
            <input
              type="text"
              id="post-title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="Nhập tiêu đề bài đăng..."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="post-content">Nội dung</label>
            <textarea
              id="post-content"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="Nhập nội dung bài đăng..."
              rows="5"
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="post-type">Loại bài đăng</label>
            <select
              id="post-type"
              value={newPost.type}
              onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
            >
              <option value="question">Câu hỏi</option>
              <option value="discussion">Thảo luận</option>
              <option value="resource">Tài nguyên</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="post-tags">Thẻ</label>
            <div className="tags-input">
              <input
                type="text"
                id="post-tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Nhập thẻ và nhấn Enter..."
              />
              <div className="tags-list">
                {newPost.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary">
            <i className="fas fa-paper-plane"></i> Đăng bài
          </button>
        </form>
      </div>

      <div className="posts-list-section">
        <h3>Bài đăng của tôi</h3>
        {posts.length > 0 ? (
          <div className="posts-list">
            {posts.map((post) => (
              <div key={post._id} className="post-item">
                <div className="post-header">
                  <div className="post-type-badge">
                    {post.type === "question" ? (
                      <span className="badge question">
                        <i className="fas fa-question-circle"></i> Câu hỏi
                      </span>
                    ) : post.type === "discussion" ? (
                      <span className="badge discussion">
                        <i className="fas fa-comments"></i> Thảo luận
                      </span>
                    ) : (
                      <span className="badge resource">
                        <i className="fas fa-book"></i> Tài nguyên
                      </span>
                    )}
                  </div>
                  <div className="post-actions">
                    <button className="delete-post-btn" onClick={() => handleDeletePost(post._id)}>
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-content">{post.content}</p>
                <div className="post-footer">
                  <div className="post-tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="post-meta">
                    <span className="post-date">
                      <i className="fas fa-calendar-alt"></i>{" "}
                      {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="post-comments">
                      <i className="fas fa-comment"></i> {post.commentsCount || 0} bình luận
                    </span>
                    <span className="post-likes">
                      <i className="fas fa-heart"></i> {post.likesCount || 0} lượt thích
                    </span>
                  </div>
                  <Link to={`/study-corner/post/${post._id}`} className="view-post-btn">
                    <i className="fas fa-eye"></i> Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>Bạn chưa có bài đăng nào</p>
            <p>Hãy tạo bài đăng đầu tiên của bạn!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostsTab
