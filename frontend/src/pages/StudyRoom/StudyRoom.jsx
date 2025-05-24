"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { Helmet } from "react-helmet"
import useSocket from "../../hooks/useSocket"
import {
  getStudyRooms,
  getMyStudyRooms,
  getStudyRoomById,
  createStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  sendMessage,
  closeStudyRoom,
} from "../../services/studyRoomService"
import VideoCallInterface from "../../components/video/VideoCallInterface"
import WhiteboardInterface from "../../components/whiteboard/WhiteboardInterface"
import EmojiPicker from "../../components/common/EmojiPicker"
import "./StudyRoom.css"

const StudyRoom = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const socket = useSocket()

  const [activeTab, setActiveTab] = useState("all") // all, my, create
  const [rooms, setRooms] = useState([])
  const [myRooms, setMyRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [subject, setSubject] = useState("")
  const [search, setSearch] = useState("")
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [usersTyping, setUsersTyping] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "math_highschool",
    topic: "",
    isPrivate: false,
    password: "",
    maxMembers: 20,
  })

  // Thêm state cho video call và whiteboard
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const [isWhiteboardActive, setIsWhiteboardActive] = useState(false)
  const [activeInterface, setActiveInterface] = useState("chat") // chat, video, whiteboard
  const [participants, setParticipants] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const messagesEndRef = useRef(null)
  const messageInputRef = useRef(null)
  const videoCallRef = useRef(null)
  const whiteboardRef = useRef(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load rooms on initial render and when filters change
  useEffect(() => {
    const loadRooms = async () => {
      if (activeTab === "all") {
        setLoading(true)
        try {
          const response = await getStudyRooms({
            page,
            subject,
            search,
            status: "active",
          })
          setRooms(response.data)
          setTotalPages(response.totalPages)
        } catch (error) {
          toast.error(error.message || "Không thể tải danh sách phòng học")
        } finally {
          setLoading(false)
        }
      } else if (activeTab === "my") {
        setLoading(true)
        try {
          const response = await getMyStudyRooms()
          setMyRooms(response.data)
        } catch (error) {
          toast.error(error.message || "Không thể tải danh sách phòng học của bạn")
        } finally {
          setLoading(false)
        }
      }
    }

    loadRooms()
  }, [activeTab, page, subject, search])

  // Load room details when ID changes
  useEffect(() => {
    if (id) {
      const loadRoomDetails = async () => {
        setLoading(true)
        try {
          const response = await getStudyRoomById(id)
          setCurrentRoom(response.data)
          setMessages(response.data.messages || [])
          setParticipants(response.data.members || [])

          // Join socket room
          if (socket) {
            socket.emit("join_room", id)
          }
        } catch (error) {
          toast.error(error.message || "Không thể tải chi tiết phòng học")
          navigate("/study-room")
        } finally {
          setLoading(false)
        }
      }

      loadRoomDetails()

      // Cleanup when leaving the room
      return () => {
        if (socket) {
          socket.emit("leave_room", id)
        }

        // Dừng video call khi rời phòng
        if (isVideoCallActive) {
          handleEndVideoCall()
        }
      }
    }
  }, [id, navigate, socket])

  // Socket event listeners
  useEffect(() => {
    if (socket && currentRoom) {
      // Listen for new messages
      socket.on("new_message", (message) => {
        setMessages((prev) => [...prev, message])
      })

      // Listen for user typing
      socket.on("user_typing", (typingUser) => {
        if (typingUser.userId !== user._id) {
          setUsersTyping((prev) => {
            if (!prev.some((u) => u.userId === typingUser.userId)) {
              return [...prev, typingUser]
            }
            return prev
          })

          // Remove typing indicator after 3 seconds
          setTimeout(() => {
            setUsersTyping((prev) => prev.filter((u) => u.userId !== typingUser.userId))
          }, 3000)
        }
      })

      // Listen for user joined
      socket.on("user_joined", (joinedUser) => {
        toast.info(`${joinedUser.username} đã tham gia phòng học`)

        // Refresh room details to get updated members list
        getStudyRoomById(currentRoom._id)
          .then((response) => {
            setCurrentRoom(response.data)
            setParticipants(response.data.members || [])
          })
          .catch((error) => {
            console.error("Error refreshing room details:", error)
          })
      })

      // Listen for user left
      socket.on("user_left", (leftUser) => {
        toast.info(`${leftUser.username} đã rời khỏi phòng học`)

        // Refresh room details to get updated members list
        getStudyRoomById(currentRoom._id)
          .then((response) => {
            setCurrentRoom(response.data)
            setParticipants(response.data.members || [])
          })
          .catch((error) => {
            console.error("Error refreshing room details:", error)
          })
      })

      // Listen for video call events
      socket.on("video_call_started", () => {
        toast.info("Cuộc gọi video đã bắt đầu. Bạn có thể tham gia!")
      })

      socket.on("video_call_ended", () => {
        if (isVideoCallActive) {
          setIsVideoCallActive(false)
          setActiveInterface("chat")
          toast.info("Cuộc gọi video đã kết thúc")
        }
      })

      socket.on("whiteboard_started", () => {
        toast.info("Bảng trắng đã được mở. Bạn có thể tham gia!")
      })

      socket.on("whiteboard_update", (data) => {
        if (whiteboardRef.current) {
          whiteboardRef.current.updateCanvas(data)
        }
      })

      // Cleanup
      return () => {
        socket.off("new_message")
        socket.off("user_typing")
        socket.off("user_joined")
        socket.off("user_left")
        socket.off("video_call_started")
        socket.off("video_call_ended")
        socket.off("whiteboard_started")
        socket.off("whiteboard_update")
      }
    }
  }, [socket, currentRoom, user, isVideoCallActive])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Handle create room form submission
  const handleCreateRoom = async (e) => {
    e.preventDefault()

    try {
      const response = await createStudyRoom(formData)
      toast.success("Tạo phòng học nhóm thành công!")
      navigate(`/study-room/${response.data._id}`)
      setShowCreateForm(false)
      setFormData({
        title: "",
        description: "",
        subject: "math_highschool",
        topic: "",
        isPrivate: false,
        password: "",
        maxMembers: 20,
      })
    } catch (error) {
      toast.error(error.message || "Không thể tạo phòng học nhóm")
    }
  }

  // Handle join room
  const handleJoinRoom = async (roomId, isPrivate) => {
    if (isPrivate) {
      setSelectedRoomId(roomId)
      setShowPasswordModal(true)
    } else {
      try {
        await joinStudyRoom(roomId)
        toast.success("Tham gia phòng học nhóm thành công!")
        navigate(`/study-room/${roomId}`)
      } catch (error) {
        toast.error(error.message || "Không thể tham gia phòng học nhóm")
      }
    }
  }

  // Handle join private room with password
  const handleJoinPrivateRoom = async () => {
    try {
      await joinStudyRoom(selectedRoomId, passwordInput)
      toast.success("Tham gia phòng học nhóm thành công!")
      navigate(`/study-room/${selectedRoomId}`)
      setShowPasswordModal(false)
      setPasswordInput("")
    } catch (error) {
      toast.error(error.message || "Mật khẩu không đúng hoặc không thể tham gia phòng học nhóm")
    }
  }

  // Handle leave room
  const handleLeaveRoom = async () => {
    if (!currentRoom) return

    try {
      await leaveStudyRoom(currentRoom._id)
      toast.success("Rời khỏi phòng học nhóm thành công!")
      navigate("/study-room")
    } catch (error) {
      toast.error(error.message || "Không thể rời khỏi phòng học nhóm")
    }
  }

  // Handle close room
  const handleCloseRoom = async () => {
    if (!currentRoom) return

    if (window.confirm("Bạn có chắc chắn muốn đóng phòng học nhóm này?")) {
      try {
        await closeStudyRoom(currentRoom._id)
        toast.success("Đóng phòng học nhóm thành công!")
        navigate("/study-room")
      } catch (error) {
        toast.error(error.message || "Không thể đóng phòng học nhóm")
      }
    }
  }

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !currentRoom) return

    try {
      await sendMessage(currentRoom._id, { content: newMessage })
      setNewMessage("")
      setShowEmojiPicker(false)

      // Focus back on input
      messageInputRef.current?.focus()
    } catch (error) {
      toast.error(error.message || "Không thể gửi tin nhắn")
    }
  }

  // Handle typing notification
  const handleTyping = () => {
    if (socket && currentRoom) {
      socket.emit("typing", { roomId: currentRoom._id })
    }
  }

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji)
  }

  // Handle start video call
  const handleStartVideoCall = () => {
    if (socket && currentRoom) {
      setIsVideoCallActive(true)
      setActiveInterface("video")
      socket.emit("start_video_call", { roomId: currentRoom._id })
      toast.success("Bắt đầu cuộc gọi video")
    }
  }

  // Handle end video call
  const handleEndVideoCall = () => {
    if (socket && currentRoom && isVideoCallActive) {
      setIsVideoCallActive(false)
      setActiveInterface("chat")
      socket.emit("end_video_call", { roomId: currentRoom._id })
      toast.info("Kết thúc cuộc gọi video")
    }
  }

  // Handle start whiteboard
  const handleStartWhiteboard = () => {
    if (socket && currentRoom) {
      setIsWhiteboardActive(true)
      setActiveInterface("whiteboard")
      socket.emit("start_whiteboard", { roomId: currentRoom._id })
      toast.success("Bắt đầu sử dụng bảng trắng")
    }
  }

  // Handle whiteboard update
  const handleWhiteboardUpdate = (data) => {
    if (socket && currentRoom) {
      socket.emit("update_whiteboard", { roomId: currentRoom._id, data })
    }
  }

  // Handle switch interface
  const handleSwitchInterface = (interfaceType) => {
    setActiveInterface(interfaceType)
  }

  // Render room list
  const renderRoomList = () => {
    const roomsToRender = activeTab === "all" ? rooms : myRooms

    if (loading && roomsToRender.length === 0) {
      return <div className="loading-spinner">Đang tải...</div>
    }

    if (roomsToRender.length === 0) {
      return (
        <div className="empty-state">
          <p>Không có phòng học nhóm nào.</p>
          <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
            Tạo phòng học nhóm mới
          </button>
        </div>
      )
    }

    return (
      <motion.div
        className="room-list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {roomsToRender.map((room) => (
          <motion.div key={room._id} className="room-card" whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <h3>{room.title}</h3>
            <p>{room.description}</p>
            <div className="room-info">
              <span>
                <i className="fas fa-users"></i> {room.members.length}/{room.maxMembers}
              </span>
              <span>
                <i className="fas fa-book"></i> {room.subject.replace("math_", "Toán ")}
              </span>
              {room.isPrivate && (
                <span className="private-badge">
                  <i className="fas fa-lock"></i> Riêng tư
                </span>
              )}
            </div>
            <div className="room-actions">
              {room.members.some((member) => member._id === user._id) ? (
                <button className="btn-secondary" onClick={() => navigate(`/study-room/${room._id}`)}>
                  Vào phòng
                </button>
              ) : (
                <button className="btn-primary" onClick={() => handleJoinRoom(room._id, room.isPrivate)}>
                  Tham gia
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  // Render room detail
  const renderRoomDetail = () => {
    if (!currentRoom) return null

    const isCreator = currentRoom.creator._id === user._id
    const isMember = currentRoom.members.some((member) => member._id === user._id)

    return (
      <div className="room-detail">
        <div className="room-header">
          <h2>{currentRoom.title}</h2>
          <div className="room-actions">
            {isMember && (
              <>
                <button
                  className={`btn-interface ${activeInterface === "chat" ? "active" : ""}`}
                  onClick={() => handleSwitchInterface("chat")}
                >
                  <i className="fas fa-comments"></i> Chat
                </button>
                <button
                  className={`btn-interface ${activeInterface === "video" ? "active" : ""}`}
                  onClick={() => {
                    if (!isVideoCallActive) {
                      handleStartVideoCall()
                    } else {
                      handleSwitchInterface("video")
                    }
                  }}
                >
                  <i className="fas fa-video"></i> Video
                </button>
                <button
                  className={`btn-interface ${activeInterface === "whiteboard" ? "active" : ""}`}
                  onClick={() => {
                    if (!isWhiteboardActive) {
                      handleStartWhiteboard()
                    } else {
                      handleSwitchInterface("whiteboard")
                    }
                  }}
                >
                  <i className="fas fa-chalkboard"></i> Bảng trắng
                </button>
                <button className="btn-danger" onClick={handleLeaveRoom}>
                  <i className="fas fa-sign-out-alt"></i> Rời phòng
                </button>
              </>
            )}
            {isCreator && (
              <button className="btn-warning" onClick={handleCloseRoom}>
                <i className="fas fa-times-circle"></i> Đóng phòng
              </button>
            )}
          </div>
        </div>

        <div className="room-content">
          <div className="room-info-panel">
            <div className="room-description">
              <h3>Mô tả</h3>
              <p>{currentRoom.description || "Không có mô tả"}</p>
            </div>

            <div className="room-members">
              <h3>
                Thành viên ({currentRoom.members.length}/{currentRoom.maxMembers})
              </h3>
              <div className="member-list">
                {currentRoom.members.map((member) => (
                  <div key={member._id} className="member-item">
                    <img
                      src={
                        member.avatar ||
                        "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png" ||
                        "/placeholder.svg"
                      }
                      alt={member.username}
                      className="member-avatar"
                    />
                    <span className="member-name">
                      {member.username}
                      {member._id === currentRoom.creator._id && <span className="creator-badge">Người tạo</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="interactive-panel">
            {activeInterface === "chat" && (
              <div className="chat-panel">
                <div className="messages-container">
                  {messages.length === 0 ? (
                    <div className="empty-messages">
                      <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`message ${message.sender._id === user._id ? "my-message" : "other-message"}`}
                      >
                        <div className="message-avatar">
                          <img
                            src={
                              message.sender.avatar ||
                              "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png" ||
                              "/placeholder.svg"
                            }
                            alt={message.sender.username}
                          />
                        </div>
                        <div className="message-content">
                          <div className="message-header">
                            <span className="message-sender">{message.sender.username}</span>
                            <span className="message-time">{new Date(message.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <div className="message-text">{message.content}</div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />

                  {usersTyping.length > 0 && (
                    <div className="typing-indicator">
                      {usersTyping.map((user) => user.username).join(", ")} đang nhập...
                    </div>
                  )}
                </div>

                {isMember && (
                  <form className="message-form" onSubmit={handleSendMessage}>
                    <button type="button" className="emoji-button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                      <i className="far fa-smile"></i>
                    </button>
                    {showEmojiPicker && (
                      <div className="emoji-picker-container">
                        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                      </div>
                    )}
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleTyping}
                      placeholder="Nhập tin nhắn..."
                      ref={messageInputRef}
                    />
                    <button type="submit" disabled={!newMessage.trim()}>
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeInterface === "video" && (
              <div className="video-panel">
                {isVideoCallActive ? (
                  <VideoCallInterface
                    roomId={currentRoom._id}
                    participants={participants}
                    user={user}
                    onEndCall={handleEndVideoCall}
                    ref={videoCallRef}
                  />
                ) : (
                  <div className="video-placeholder">
                    <p>Cuộc gọi video chưa được bắt đầu</p>
                    <button className="btn-primary" onClick={handleStartVideoCall}>
                      <i className="fas fa-video"></i> Bắt đầu cuộc gọi
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeInterface === "whiteboard" && (
              <div className="whiteboard-panel">
                <WhiteboardInterface roomId={currentRoom._id} onUpdate={handleWhiteboardUpdate} ref={whiteboardRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render create room form
  const renderCreateForm = () => {
    return (
      <div className="create-room-form">
        <h2>Tạo phòng học nhóm mới</h2>
        <form onSubmit={handleCreateRoom}>
          <div className="form-group">
            <label htmlFor="title">Tên phòng học *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={100}
              placeholder="Nhập tên phòng học..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              maxLength={500}
              placeholder="Mô tả về phòng học..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Môn học *</label>
            <select id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required>
              <option value="math_primary">Toán Tiểu học</option>
              <option value="math_secondary">Toán THCS</option>
              <option value="math_highschool">Toán THPT</option>
              <option value="math_university">Toán Đại học</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="topic">Chủ đề</label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              maxLength={100}
              placeholder="Ví dụ: Đại số, Hình học, Giải tích..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxMembers">Số lượng thành viên tối đa</label>
            <input
              type="number"
              id="maxMembers"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleInputChange}
              min={2}
              max={50}
            />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isPrivate"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleInputChange}
            />
            <label htmlFor="isPrivate">Phòng học riêng tư (yêu cầu mật khẩu)</label>
          </div>

          {formData.isPrivate && (
            <div className="form-group">
              <label htmlFor="password">Mật khẩu *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={formData.isPrivate}
                minLength={4}
                maxLength={20}
                placeholder="Nhập mật khẩu cho phòng học..."
              />
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Tạo phòng học
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Render password modal
  const renderPasswordModal = () => {
    if (!showPasswordModal) return null

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Nhập mật khẩu</h3>
          <p>Phòng học này yêu cầu mật khẩu để tham gia.</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Nhập mật khẩu..."
          />
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setShowPasswordModal(false)}>
              Hủy
            </button>
            <button className="btn-primary" onClick={handleJoinPrivateRoom}>
              Tham gia
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="study-room-page">
      <Helmet>
        <title>FunMath - Phòng học nhóm</title>
        <meta
          name="description"
          content="Tham gia phòng học nhóm để học tập và trao đổi kiến thức Toán học cùng bạn bè."
        />
      </Helmet>

      {!id ? (
        <motion.div
          className="study-room-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="page-header">
            <h1>Phòng học nhóm</h1>
            <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
              <i className="fas fa-plus"></i> Tạo phòng mới
            </button>
          </div>

          <div className="filter-bar">
            <div className="tabs">
              <button className={`tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
                <i className="fas fa-globe"></i> Tất cả phòng
              </button>
              <button className={`tab ${activeTab === "my" ? "active" : ""}`} onClick={() => setActiveTab("my")}>
                <i className="fas fa-user"></i> Phòng của tôi
              </button>
            </div>

            {activeTab === "all" && (
              <div className="filters">
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="filter-select">
                  <option value="">Tất cả môn học</option>
                  <option value="math_primary">Toán Tiểu học</option>
                  <option value="math_secondary">Toán THCS</option>
                  <option value="math_highschool">Toán THPT</option>
                  <option value="math_university">Toán Đại học</option>
                  <option value="other">Khác</option>
                </select>

                <div className="search-container">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm phòng học..."
                    className="search-input"
                  />
                  {search && (
                    <button className="clear-search" onClick={() => setSearch("")}>
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {showCreateForm ? renderCreateForm() : renderRoomList()}

          {activeTab === "all" && totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="pagination-button">
                <i className="fas fa-chevron-left"></i> Trang trước
              </button>
              <span className="pagination-info">
                Trang {page} / {totalPages}
              </span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="pagination-button">
                Trang sau <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="study-room-detail-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="back-button">
            <button onClick={() => navigate("/study-room")}>
              <i className="fas fa-arrow-left"></i> Quay lại danh sách
            </button>
          </div>

          {loading ? <div className="loading-spinner">Đang tải...</div> : renderRoomDetail()}
        </motion.div>
      )}

      {renderPasswordModal()}
    </div>
  )
}

export default StudyRoom
