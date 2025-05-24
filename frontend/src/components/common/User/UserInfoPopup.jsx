"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import api from "../../../services/api";
import "./UserInfoPopup.css";

const UserInfoPopup = ({ userId, onClose, position }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/users/${userId}`);
        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin người dùng");
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }

    // Đóng popup khi click ra ngoài
    const handleClickOutside = (e) => {
      if (e.target.closest(".user-info-popup") === null) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userId, onClose]);

  if (loading) {
    return (
      <div
        className="user-info-popup"
        style={{
          top: position?.top || "50%",
          left: position?.left || "50%",
          transform: position ? "translate(0, 10px)" : "translate(-50%, -50%)",
        }}
      >
        <div className="popup-content">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div
        className="user-info-popup"
        style={{
          top: position?.top || "50%",
          left: position?.left || "50%",
          transform: position ? "translate(0, 10px)" : "translate(-50%, -50%)",
        }}
      >
        <div className="popup-content">
          <p className="error-message">
            {error || "Không tìm thấy thông tin người dùng"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="user-info-popup"
      style={{
        top: position?.top || "50%",
        left: position?.left || "50%",
        transform: position ? "translate(0, 10px)" : "translate(-50%, -50%)",
      }}
    >
      <div className="popup-content">
        <div className="popup-header">
          <img
            src={
              userData.avatar ||
              "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png" ||
              "/placeholder.svg"
            }
            alt={`Avatar của ${userData.username}`}
            className="popup-avatar"
          />
          <h3 className="popup-username">{userData.username}</h3>
          <span className="popup-role">
            {userData.role === "admin"
              ? "Quản trị viên"
              : userData.role === "teacher"
              ? "Giáo viên"
              : "Học sinh"}
          </span>
        </div>
        <div className="popup-body">
          {userData.bio && <p className="popup-bio">{userData.bio}</p>}
          <p className="popup-join-date">
            Tham gia từ: {format(new Date(userData.createdAt), "dd/MM/yyyy")}
          </p>
          <div className="popup-stats">
            <div className="stat-item">
              <span className="stat-value">{userData.followersCount || 0}</span>
              <span className="stat-label">Người theo dõi</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{userData.followingCount || 0}</span>
              <span className="stat-label">Đang theo dõi</span>
            </div>
          </div>
        </div>
        <div className="popup-footer">
          <a
            href={`/users/profile/${userData._id}`}
            className="view-profile-btn"
          >
            Xem hồ sơ
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserInfoPopup;
