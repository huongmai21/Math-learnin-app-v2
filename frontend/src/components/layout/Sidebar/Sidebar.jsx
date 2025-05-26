import React from "react";
import { NavLink } from "react-router-dom"; // Thêm NavLink
import { Tooltip } from "react-tooltip";
import "./Sidebar.css";

const Sidebar = ({ activeTab, user, tabs }) => {
  const defaultTabs = [
    { id: "exercise", icon: "fa-solid fa-pen", label: "Góc giải bài tập", path: "/study-corner" },
    { id: "study", icon: "fa-solid fa-book", label: "Góc học tập", path: "/study-room" },
    { id: "share", icon: "fa-solid fa-share", label: "Góc chia sẻ", path: "/posts" },
    { id: "bookmarks", icon: "fa-solid fa-bookmark", label: "Bookmarks", path: "/bookmarks" },
    { id: "notifications", icon: "fa-solid fa-bell", label: "Thông báo", path: "/notifications" },
  ];

  const profileTabs = [
    { id: "overview", icon: "fa-solid fa-id-card", label: "Profile", path: "/users/profile" },
    ...(user?.role === "student"
      ? [{ id: "stats", icon: "fa-solid fa-chart-line", label: "Thống kê", path: "/users/profile/stats" }]
      : []),
    { id: "friends", icon: "fa-solid fa-users", label: "Bạn bè", path: "/users/profile/friends" },
    { id: "library", icon: "fa-solid fa-book-bookmark", label: "Bookmarks", path: "/users/profile/library" },
    { id: "posts", icon: "fa-solid fa-paper-plane", label: "Bài đăng", path: "/users/profile/posts" },
    ...(user?.role !== "admin"
      ? [
          {
            id: "courses",
            icon: "fa-solid fa-graduation-cap",
            label: "Khóa học",
            path: "/courses/my-courses",
          },
        ]
      : []),
    ...(user?.role === "teacher"
      ? [
          {
            id: "create-exam",
            icon: "fa-solid fa-ranking-star",
            label: "Tạo đề thi",
            path: "/exams/create",
          },
        ]
      : []),
  ];

  const adminTabs = [
    { id: "stats", icon: "fa-solid fa-chart-line", label: "Thống kê", path: "/admin/stats" },
    { id: "users", icon: "fa-solid fa-users", label: "Người dùng", path: "/admin/users" },
    { id: "library", icon: "fa-solid fa-book", label: "Tài liệu", path: "/admin/documents" },
    { id: "news", icon: "fa-solid fa-newspaper", label: "Tin tức", path: "/admin/news" },
    { id: "course", icon: "fa-solid fa-film", label: "Khóa học", path: "/admin/courses" },
    { id: "exams", icon: "fa-solid fa-ranking-star", label: "Đề thi", path: "/admin/exams" },
  ];

  const tabList =
    tabs === "profile"
      ? profileTabs
      : tabs === "admin"
      ? adminTabs
      : defaultTabs;

  return (
    <div className="sidebar">
      <ul>
        {tabList.map((tab) => (
          <li key={tab.id}>
            <NavLink
              to={tab.path}
              className={({ isActive }) => (isActive ? "active" : "")}
              data-tooltip-id={`${tab.id}-tab`}
              data-tooltip-content={tab.label}
            >
              <i className={tab.icon}></i>
            </NavLink>
          </li>
        ))}
      </ul>
      {tabList.map((tab) => (
        <Tooltip
          key={tab.id}
          id={`${tab.id}-tab`}
          place="right"
          className="z-[1000] bg-[#333] text-white text-sm rounded-md px-2 py-1"
        />
      ))}
    </div>
  );
};

export default Sidebar;