// frontend/src/components/layout/Sidebar/Sidebar.jsx
import React from "react";
import { Tooltip } from "react-tooltip";
import "./Sidebar.css";

const Sidebar = ({ activeTab, onTabChange, user, tabs }) => {
  const defaultTabs = [
    { id: "exercise", icon: "fa-solid fa-pen", label: "Góc giải bài tập" },
    { id: "study", icon: "fa-solid fa-book", label: "Góc học tập" },
    { id: "share", icon: "fa-solid fa-share", label: "Góc chia sẻ" },
    { id: "bookmarks", icon: "fa-solid fa-bookmark", label: "Bookmarks" },
    { id: "notifications", icon: "fa-solid fa-bell", label: "Thông báo" },
  ];

  const profileTabs = [
    { id: "overview", icon: "fa-solid fa-id-card", label: "Profile" },
    ...(user?.role === "student"
      ? [{ id: "stats", icon: "fa-solid fa-chart-line", label: "Thống kê" }]
      : []),
    { id: "friends", icon: "fa-solid fa-users", label: "Bạn bè" },
    { id: "library", icon: "fa-solid fa-book-bookmark", label: "Bookmarks" },
    { id: "posts", icon: "fa-solid fa-paper-plane", label: "Bài đăng" },
    ...(user?.role !== "admin"
      ? [
          {
            id: "courses",
            icon: "fa-solid fa-graduation-cap",
            label: "Khóa học",
          },
        ]
      : []),
    ...(user?.role === "teacher"
      ? [
          {
            id: "create-exam",
            icon: "fa-solid fa-ranking-star",
            label: "Tạo đề thi",
          },
        ]
      : []),
  ];

  const adminTabs = [
    { id: "stats", icon: "fa-solid fa-chart-line", label: "Thống kê" },
    { id: "users", icon: "fa-solid fa-users", label: "Người dùng" },
    { id: "library", icon: "fa-solid fa-book", label: "Tài liệu" },
    { id: "news", icon: "fa-solid fa-newspaper", label: "Tin tức" },
    { id: "course", icon: "fa-solid fa-film", label: "Khóa học" },
    { id: "exams", icon: "fa-solid fa-ranking-star", label: "Đề thi" },
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
          <li
            key={tab.id}
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => onTabChange(tab.id)}
            data-tooltip-id={`${tab.id}-tab`}
            data-tooltip-content={tab.label}
          >
            <i className={tab.icon}></i>
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
