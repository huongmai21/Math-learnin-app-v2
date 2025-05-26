"use client";

import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/slices/authSlice";
import { toast } from "react-toastify";
import ThemeContext from "../../../context/ThemeContext";
import {
  getNotifications,
  getUnreadCount,
  deleteNotification,
  markNotificationAsRead,
  initSocket,
  listenForNotifications,
} from "../../../services/notificationService";
import useDropdown from "../../../hooks/useDropdown";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dropdown hooks
  const {
    isOpen: documentsOpen,
    toggle: toggleDocuments,
    ref: documentsRef,
  } = useDropdown();
  const { isOpen: newsOpen, toggle: toggleNews, ref: newsRef } = useDropdown();
  const {
    isOpen: profileOpen,
    toggle: toggleProfile,
    ref: profileRef,
  } = useDropdown();
  const {
    isOpen: notificationsOpen,
    toggle: toggleNotifications,
    ref: notificationsRef,
  } = useDropdown();
  const {
    isOpen: settingsOpen,
    toggle: toggleSettings,
    ref: settingsRef,
  } = useDropdown();

  // Menu items
  const menuItems = [
    {
      title: "Tài liệu",
      isDropdown: true,
      open: documentsOpen,
      toggle: toggleDocuments,
      ref: documentsRef,
      items: [
        { to: "/documents/grade1", label: "Cấp 1" },
        { to: "/documents/grade2", label: "Cấp 2" },
        { to: "/documents/grade3", label: "Cấp 3" },
        { to: "/documents/university", label: "Đại học" },
      ],
      requireAuth: false,
    },
    {
      title: "Tin tức",
      isDropdown: true,
      open: newsOpen,
      toggle: toggleNews,
      ref: newsRef,
      items: [
        { to: "/news/education", label: "Thông tin giáo dục" },
        { to: "/news/magazine", label: "Tạp chí Toán" },
      ],
      requireAuth: false,
    },
    {
      title: "Khóa học",
      to: "/courses",
      isDropdown: false,
      requireAuth: false,
    },
    { title: "Thi đấu", to: "/exams", isDropdown: false, requireAuth: true },
    {
      title: "Góc học tập",
      to: "/study-corner",
      isDropdown: false,
      requireAuth: true,
    },
    {
      title: "Phòng học nhóm",
      to: "/study-room",
      isDropdown: false,
      requireAuth: true,
    },
  ];

  // Khởi tạo WebSocket và lấy thông báo
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Khởi tạo socket
    const socket = initSocket(token);

    // Lắng nghe thông báo thời gian thực
    listenForNotifications(user._id, (notification) => {
      if (notification.type === "ack") {
        loadNotifications();
      } else {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    });

    // Lấy thông báo và số chưa đọc
    const loadNotifications = async () => {
      try {
        const [notifResponse, unreadResponse] = await Promise.all([
          getNotifications(1, 10, false),
          getUnreadCount(),
        ]);
        setNotifications(notifResponse.data || []);
        setUnreadCount(unreadResponse.count || 0);
      } catch (error) {
        toast.error("Không thể tải thông báo!", { position: "top-right" });
      }
    };

    loadNotifications();

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user]);

  // Đóng menu mobile khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Xử lý đăng xuất
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Đăng xuất thành công!", { position: "top-right" });
    navigate("/auth/login");
  };

  // Xử lý xóa thông báo
  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Xóa thông báo thành công!", { position: "top-right" });
    } catch (error) {
      toast.error("Không thể xóa thông báo!", { position: "top-right" });
    }
  };

  // Xử lý đánh dấu thông báo đã đọc
  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      navigate(notifications.find((n) => n._id === id)?.link || "/notifications");
    } catch (error) {
      toast.error("Không thể đánh dấu đã đọc!", { position: "top-right" });
    }
  };

  // Toggle menu di động
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const defaultAvatar =
    "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png";

  return (
    <header className="header" aria-label="Thanh điều hướng chính">
      <div className="navbar-container">
        <Link to="/" className="logo" aria-label="FunMath - Trang chủ">
          <i className="fa-solid fa-bahai"></i> FunMath
        </Link>
        <button
          className="hamburger"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? "✖" : "☰"}
        </button>
        <nav
          className={`navbar ${isMobileMenuOpen ? "active" : ""}`}
          aria-label="Menu điều hướng"
        >
          {menuItems.map((item, index) => {
            if (item.requireAuth && !isAuthenticated) return null;
            return item.isDropdown ? (
              <div
                key={index}
                className={`dropdown menu-item ${item.open ? "active" : ""}`}
                ref={item.ref}
                onClick={item.toggle}
                aria-haspopup="true"
                aria-expanded={item.open}
              >
                <span className="dropdown-title">{item.title}</span>
                <span className="left-icon"></span>
                <span className="right-icon"></span>
                {item.open && (
                  <div className="items" role="menu">
                    {item.items.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.to}
                        style={{ "--i": subIndex + 1 }}
                        role="menuitem"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={index} to={item.to} className="menu-item">
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : isAuthenticated && user ? (
        <div className="user-actions">
          <div
            className="user-info"
            ref={profileRef}
            onClick={toggleProfile}
            aria-haspopup="true"
            aria-expanded={profileOpen}
          >
            <div className="avatar">
              <img
                src={user.avatar || defaultAvatar}
                alt={`Avatar của ${user.username}`}
                onError={(e) => (e.target.src = defaultAvatar)}
              />
            </div>
            <span className="profile-username">{user.username}</span>
            {profileOpen && (
              <div className="profile-dropdown" role="menu">
                <Link to="/users/profile" className="dropdown-item" role="menuitem">
                  Hồ sơ
                </Link>
                {user.role === "student" && (
                  <>
                    <Link
                      to="/courses/my-courses"
                      className="dropdown-item"
                      role="menuitem"
                    >
                      Khóa học của tôi
                    </Link>
                    <Link
                      to="/achievements"
                      className="dropdown-item"
                      role="menuitem"
                    >
                      Thành tích
                    </Link>
                  </>
                )}
                {user.role === "teacher" && (
                  <Link
                    to="/courses/my-courses"
                    className="dropdown-item"
                    role="menuitem"
                  >
                    Khóa học của tôi
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link to="/admin/documents" className="dropdown-item" role="menuitem">
                    Quản lý hệ thống
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="dropdown-item logout"
                  role="menuitem"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
          <div
            className="notification-container"
            ref={notificationsRef}
            onClick={toggleNotifications}
            aria-label="Thông báo"
            aria-expanded={notificationsOpen}
          >
            <i className="fa-solid fa-bell notification-icon"></i>
            {unreadCount > 0 && (
              <span className="notification-count">{unreadCount}</span>
            )}
            {notificationsOpen && (
              <div className="notification-dropdown" role="menu">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`notification-item ${notif.isRead ? "read" : ""}`}
                      onClick={() => handleMarkAsRead(notif._id)}
                    >
                      <span className="notification-title">{notif.title}</span>
                      <p className="notification-text">{notif.message}</p>
                      <span className="notification-time">
                        {new Date(notif.createdAt).toLocaleString("vi-VN")}
                      </span>
                      <button
                        className="delete-notification"
                        onClick={(e) => handleDeleteNotification(notif._id, e)}
                        aria-label={`Xóa thông báo: ${notif.message}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="notification-item">Không có thông báo</div>
                )}
              </div>
            )}
          </div>
          <div className="settings-container" ref={settingsRef}>
            <i
              className="fa-solid fa-gear settings-icon"
              onClick={toggleSettings}
              aria-label="Mở cài đặt"
              aria-expanded={settingsOpen}
            ></i>
            {settingsOpen && (
              <div className="settings-modal" role="dialog" aria-labelledby="settings-title">
                <div className="settings-content">
                  <h3 id="settings-title">Cài đặt</h3>
                  <div className="settings-option">
                    <label htmlFor="notifications-toggle">Thông báo</label>
                    <input
                      id="notifications-toggle"
                      type="checkbox"
                      defaultChecked
                    />
                  </div>
                  <div className="settings-option">
                    <label>Chế độ hiển thị</label>
                    <button className="theme-toggle" onClick={toggleTheme}>
                      <i
                        className={
                          theme === "light"
                            ? "fa-solid fa-sun"
                            : "fa-solid fa-moon"
                        }
                      ></i>
                      {theme === "light" ? "Sáng" : "Tối"}
                    </button>
                  </div>
                  <button
                    className="close-settings"
                    onClick={toggleSettings}
                    aria-label="Đóng cài đặt"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="auth-links">
          <Link to="/auth/login" className="auth-link">
            Đăng nhập
          </Link>
          <Link to="/auth/register" className="auth-link">
            Đăng ký
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;