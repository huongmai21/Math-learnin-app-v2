"use client";
import "./Sidebar.css";

const Sidebar = ({ activeTab, onTabChange, user, tabs = "default" }) => {
  // Xác định danh sách tab dựa trên loại sidebar
  const getTabList = () => {
    if (tabs === "profile") {
      const tabList = [
        { id: "overview", icon: "fa-user", label: "Tổng quan" },
        { id: "library", icon: "fa-book", label: "Thư viện" },
        { id: "friends", icon: "fa-users", label: "Bạn bè" },
        { id: "posts", icon: "fa-comments", label: "Học tập" },
        { id: "courses", icon: "fa-graduation-cap", label: "Khóa học" },
      ];

      // Thêm tab thống kê nếu là học sinh
      if (user?.role === "student") {
        tabList.splice(1, 0, {
          id: "stats",
          icon: "fa-chart-line",
          label: "Thống kê",
        });
      }

      // Thêm tab tạo đề thi nếu là giáo viên
      if (user?.role === "teacher") {
        tabList.push({
          id: "create-exam",
          icon: "fa-file-alt",
          label: "Tạo đề thi",
        });
      }

      return tabList;
    }

    // Sidebar mặc định
    return [
      { id: "dashboard", icon: "fa-tachometer-alt", label: "Tổng quan" },
      { id: "courses", icon: "fa-graduation-cap", label: "Khóa học" },
      { id: "documents", icon: "fa-book", label: "Tài liệu" },
      { id: "exams", icon: "fa-file-alt", label: "Đề thi" },
      { id: "forum", icon: "fa-comments", label: "Diễn đàn" },
      { id: "settings", icon: "fa-cog", label: "Cài đặt" },
    ];
  };

  const tabList = getTabList();

  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
        {tabList.map((tab) => (
          <li
            key={tab.id}
            className={`sidebar-item ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
