"use client"

import { useState } from "react"
import UserInfoPopup from "./UserInfoPopup"
import "./UserAvatar.css"

const UserAvatar = ({ user, showUsername = true, size = "medium" }) => {
  const [showPopup, setShowPopup] = useState(false)
  const [popupPosition, setPopupPosition] = useState(null)
  const defaultAvatar = "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png"

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPopupPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX + rect.width / 2 - 150, // Căn giữa popup
    })
    setShowPopup(true)
  }

  const sizeClass = {
    small: "avatar-small",
    medium: "avatar-medium",
    large: "avatar-large",
  }[size]

  return (
    <div className="user-avatar-container">
      <div className="user-avatar-wrapper" onClick={handleClick}>
        <img
          src={user?.avatar || defaultAvatar}
          alt={`Avatar của ${user?.username || "người dùng"}`}
          className={`user-avatar ${sizeClass}`}
          onError={(e) => {
            e.target.src = defaultAvatar
          }}
        />
        {showUsername && user?.username && <span className="user-avatar-username">{user.username}</span>}
      </div>

      {showPopup && <UserInfoPopup userId={user?._id} onClose={() => setShowPopup(false)} position={popupPosition} />}
    </div>
  )
}

export default UserAvatar
