// AdminDashboard.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  getUsers,
  deleteUser,
  updateUserRole,
  getCourses,
  approveCourse,
  rejectCourse,
  deleteCourse,
  getExams,
  approveExam,
  rejectExam,
  deleteExam,
  getNews,
  approveNews,
  rejectNews,
  deleteNews,
  getDocuments,
  approveDocument,
  rejectDocument,
  deleteDocument,
  getBookmarks,
  deleteBookmark,
  getStats,
  getDetailedStats,
} from "../../services/adminService";
import "./AdminDashboard.css";

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [news, setNews] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [libraryItems, setBookmarks] = useState([]);
  const [comments, setComments] = useState([]); // Thêm state cho bình luận
  const [questions, setQuestions] = useState([]); // Thêm state cho hỏi đáp
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalCourses: 0,
    totalPosts: 0,
    totalDocuments: 0,
    totalNews: 0,
  });
  const [newsStats, setNewsStats] = useState(null); // Thêm state cho thống kê tin tức
  const [detailedStats, setDetailedStats] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTag, setFilterTag] = useState(""); // Bộ lọc theo tag
  const [filterDate, setFilterDate] = useState(""); // Bộ lọc theo ngày
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showCreateNews, setShowCreateNews] = useState(false); // Modal tạo tin tức
  const [showEditNews, setShowEditNews] = useState(null); // Modal chỉnh sửa tin tức
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    category: "education",
    tags: "",
    image: null,
    pdfFile: null,
    issueNumber: "",
    year: "",
  });

  // Hàm fetch dữ liệu
  const fetchData = useCallback(async () => {
    if (!user || user.role !== "admin") return;

    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case "dashboard":
          const statsResponse = await getStats();
          setStats(statsResponse.data || generateMockStats());
          const detailedStatsResponse = await getDetailedStats(statsPeriod);
          setDetailedStats(
            detailedStatsResponse.data || generateMockDetailedStats()
          );
          // Thêm thống kê lượt xem tin tức
          const newsStatsResponse = await getNewsStats();
          setNewsStats(newsStatsResponse.data || generateMockNewsStats());
          break;
        case "users":
          const usersResponse = await getUsers();
          setUsers(usersResponse.data.users || generateMockUsers());
          break;
        case "courses":
          const coursesResponse = await getCourses();
          setCourses(coursesResponse.data.courses || generateMockCourses());
          break;
        case "exams":
          const examsResponse = await getExams();
          setExams(examsResponse.data.exams || generateMockExams());
          break;
        case "news":
          const newsResponse = await getNews();
          setNews(newsResponse.data.news || generateMockNews());
          break;
        case "documents":
          const documentsResponse = await getDocuments();
          setDocuments(
            documentsResponse.data.documents || generateMockDocuments()
          );
          break;
        case "library":
          const libraryResponse = await getBookmarks();
          setBookmarks(
            libraryResponse.data.items || generateMockLibraryItems()
          );
          break;
        case "comments":
          const commentsResponse = await getComments();
          setComments(commentsResponse.data.comments || generateMockComments());
          break;
        case "questions":
          const questionsResponse = await getQuestions();
          setQuestions(
            questionsResponse.data.questions || generateMockQuestions()
          );
          break;
        default:
          break;
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu! Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [activeTab, statsPeriod, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hàm tạo dữ liệu mẫu
  const generateMockStats = () => ({
    totalUsers: 120,
    totalExams: 45,
    totalCourses: 30,
    totalPosts: 250,
    totalDocuments: 85,
    totalNews: 42,
  });

  const generateMockDetailedStats = () => {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString("vi-VN");
    });

    return {
      newUsers: dates.map((date) => ({
        date,
        count: Math.floor(Math.random() * 10) + 1,
      })),
      activities: dates.map((date) => ({
        date,
        count: Math.floor(Math.random() * 50) + 10,
      })),
    };
  };

  const generateMockNewsStats = () => ({
    viewsByCategory: [
      { category: "education", views: 500 },
      { category: "math-magazine", views: 300 },
      { category: "science", views: 200 },
      { category: "competitions", views: 100 },
    ],
  });

  const generateMockUsers = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      _id: `user_${i + 1}`,
      username: `user_${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 5 === 0 ? "admin" : i % 3 === 0 ? "teacher" : "student",
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ).toISOString(),
    }));
  };

  const generateMockCourses = () => {
    const statuses = ["pending", "approved", "rejected"];
    return Array.from({ length: 15 }, (_, i) => ({
      _id: `course_${i + 1}`,
      title: `Khóa học mẫu ${i + 1}`,
      description: `Mô tả khóa học mẫu ${i + 1}`,
      price: Math.floor(Math.random() * 1000000),
      author: { username: `teacher_${(i % 5) + 1}` },
      status: statuses[i % 3],
    }));
  };

  const generateMockExams = () => {
    const statuses = ["pending", "approved", "rejected"];
    const educationLevels = [
      "grade1",
      "grade2",
      "grade3",
      "grade4",
      "grade5",
      "grade6",
      "grade7",
      "grade8",
      "grade9",
      "grade10",
      "grade11",
      "grade12",
      "university",
    ];
    return Array.from({ length: 15 }, (_, i) => ({
      _id: `exam_${i + 1}`,
      title: `Đề thi mẫu ${i + 1}`,
      description: `Mô tả đề thi mẫu ${i + 1}`,
      author: { username: `teacher_${(i % 5) + 1}` },
      educationLevel: educationLevels[i % educationLevels.length],
      subject: "math",
      status: statuses[i % 3],
    }));
  };

  const generateMockNews = () => {
    const statuses = ["pending", "approved", "rejected"];
    const categories = [
      "education",
      "math-magazine",
      "science",
      "competitions",
    ];
    return Array.from({ length: 15 }, (_, i) => ({
      _id: `news_${i + 1}`,
      title: `Tin tức mẫu ${i + 1}`,
      summary: `Tóm tắt tin tức mẫu ${i + 1}`,
      content: `Nội dung tin tức mẫu ${i + 1}`,
      author: { username: `author_${(i % 5) + 1}` },
      category: categories[i % categories.length],
      tags: ["math", "education"],
      status: statuses[i % 3],
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ).toISOString(),
    }));
  };

  const generateMockDocuments = () => {
    const statuses = ["pending", "approved", "rejected"];
    const educationLevels = ["primary", "secondary", "high", "university"];
    const documentTypes = [
      "Sách giáo khoa",
      "Sách bài tập",
      "Tài liệu tham khảo",
      "Đề thi mẫu",
      "Bài giảng",
    ];
    return Array.from({ length: 15 }, (_, i) => ({
      _id: `document_${i + 1}`,
      title: `Tài liệu mẫu ${i + 1}`,
      description: `Mô tả tài liệu mẫu ${i + 1}`,
      uploadedBy: { username: `uploader_${(i % 5) + 1}` },
      educationLevel: educationLevels[i % educationLevels.length],
      documentType: documentTypes[i % documentTypes.length],
      status: statuses[i % 3],
    }));
  };

  const generateMockLibraryItems = () => {
    const types = ["document", "news"];
    return Array.from({ length: 15 }, (_, i) => ({
      _id: `library_${i + 1}`,
      title: `Mục thư viện mẫu ${i + 1}`,
      type: types[i % 2],
      user: { username: `user_${(i % 5) + 1}` },
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ).toISOString(),
    }));
  };

  const generateMockComments = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      _id: `comment_${i + 1}`,
      content: `Bình luận mẫu ${i + 1}`,
      author: { username: `user_${(i % 5) + 1}` },
      referenceId: `news_${(i % 5) + 1}`,
      referenceType: "article",
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ).toISOString(),
    }));
  };

  const generateMockQuestions = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      _id: `question_${i + 1}`,
      content: `Câu hỏi mẫu ${i + 1}`,
      author: { username: `user_${(i % 5) + 1}` },
      status: i % 2 === 0 ? "pending" : "answered",
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ).toISOString(),
    }));
  };

  // Xử lý tạo tin tức
  const handleCreateNews = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("summary", formData.summary);
      data.append("category", formData.category);
      data.append(
        "tags",
        formData.tags.split(",").map((tag) => tag.trim())
      );
      if (formData.image) data.append("image", formData.image);
      if (formData.pdfFile) data.append("file", formData.pdfFile);
      if (formData.category === "math-magazine") {
        data.append("issueNumber", formData.issueNumber);
        data.append("year", formData.year);
      }

      const response = await createNews(data);
      setNews([...news, response.data.news]);
      setShowCreateNews(false);
      setFormData({
        title: "",
        content: "",
        summary: "",
        category: "education",
        tags: "",
        image: null,
        pdfFile: null,
        issueNumber: "",
        year: "",
      });
      toast.success("Tạo tin tức thành công!");
    } catch (err) {
      toast.error(
        "Tạo tin tức thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  // Xử lý chỉnh sửa tin tức
  const handleEditNews = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("summary", formData.summary);
      data.append("category", formData.category);
      data.append(
        "tags",
        formData.tags.split(",").map((tag) => tag.trim())
      );
      if (formData.image) data.append("image", formData.image);
      if (formData.pdfFile) data.append("file", formData.pdfFile);
      if (formData.category === "math-magazine") {
        data.append("issueNumber", formData.issueNumber);
        data.append("year", formData.year);
      }

      const response = await updateNews(showEditNews._id, data);
      setNews(
        news.map((item) =>
          item._id === showEditNews._id ? response.data.news : item
        )
      );
      setShowEditNews(null);
      setFormData({
        title: "",
        content: "",
        summary: "",
        category: "education",
        tags: "",
        image: null,
        pdfFile: null,
        issueNumber: "",
        year: "",
      });
      toast.success("Cập nhật tin tức thành công!");
    } catch (err) {
      toast.error(
        "Cập nhật tin tức thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  // Xử lý người dùng, khóa học, đề thi, tài liệu, thư viện (giữ nguyên từ mã cũ)
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      await deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
      toast.success("Xóa người dùng thành công!");
    } catch (err) {
      toast.error(
        "Xóa người dùng thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      setUsers(users.map((u) => (u._id === userId ? { ...u, role } : u)));
      toast.success("Cập nhật vai trò người dùng thành công!");
    } catch (err) {
      toast.error(
        "Cập nhật vai trò thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleApproveCourse = async (courseId) => {
    try {
      const response = await approveCourse(courseId);
      setCourses(
        courses.map((course) =>
          course._id === courseId ? response.data.course : course
        )
      );
      toast.success("Duyệt khóa học thành công!");
    } catch (err) {
      toast.error(
        "Duyệt khóa học thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleRejectCourse = async (courseId) => {
    try {
      const response = await rejectCourse(courseId);
      setCourses(
        courses.map((course) =>
          course._id === courseId ? response.data.course : course
        )
      );
      toast.success("Từ chối khóa học thành công!");
    } catch (err) {
      toast.error(
        "Từ chối khóa học thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) return;
    try {
      await deleteCourse(courseId);
      setCourses(courses.filter((course) => course._id !== courseId));
      toast.success("Xóa khóa học thành công!");
    } catch (err) {
      toast.error(
        "Xóa khóa học thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleApproveExam = async (examId) => {
    try {
      const response = await approveExam(examId);
      setExams(
        exams.map((exam) => (exam._id === examId ? response.data.exam : exam))
      );
      toast.success("Duyệt đề thi thành công!");
    } catch (err) {
      toast.error(
        "Duyệt đề thi thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleRejectExam = async (examId) => {
    try {
      const response = await rejectExam(examId);
      setExams(
        exams.map((exam) => (exam._id === examId ? response.data.exam : exam))
      );
      toast.success("Từ chối đề thi thành công!");
    } catch (err) {
      toast.error(
        "Từ chối đề thi thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đề thi này?")) return;
    try {
      await deleteExam(examId);
      setExams(exams.filter((exam) => exam._id !== examId));
      toast.success("Xóa đề thi thành công!");
    } catch (err) {
      toast.error(
        "Xóa đề thi thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleApproveNews = async (newsId) => {
    try {
      const response = await approveNews(newsId);
      setNews(
        news.map((item) => (item._id === newsId ? response.data.news : item))
      );
      toast.success("Duyệt tin tức thành công!");
    } catch (err) {
      toast.error(
        "Duyệt tin tức thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleRejectNews = async (newsId) => {
    try {
      const response = await rejectNews(newsId);
      setNews(
        news.map((item) => (item._id === newsId ? response.data.news : item))
      );
      toast.success("Từ chối tin tức thành công!");
    } catch (err) {
      toast.error(
        "Từ chối tin tức thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tin tức này?")) return;
    try {
      await deleteNews(newsId);
      setNews(news.filter((item) => item._id !== newsId));
      toast.success("Xóa tin tức thành công!");
    } catch (err) {
      toast.error(
        "Xóa tin tức thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleApproveDocument = async (documentId) => {
    try {
      const response = await approveDocument(documentId);
      setDocuments(
        documents.map((doc) =>
          doc._id === documentId ? response.data.document : doc
        )
      );
      toast.success("Duyệt tài liệu thành công!");
    } catch (err) {
      toast.error(
        "Duyệt tài liệu thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleRejectDocument = async (documentId) => {
    try {
      const response = await rejectDocument(documentId);
      setDocuments(
        documents.map((doc) =>
          doc._id === documentId ? response.data.document : doc
        )
      );
      toast.success("Từ chối tài liệu thành công!");
    } catch (err) {
      toast.error(
        "Từ chối tài liệu thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    try {
      await deleteDocument(documentId);
      setDocuments(documents.filter((doc) => doc._id !== documentId));
      toast.success("Xóa tài liệu thành công!");
    } catch (err) {
      toast.error(
        "Xóa tài liệu thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleDeleteBookmark = async (itemId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục này khỏi thư viện?"))
      return;
    try {
      await deleteBookmark(itemId);
      setBookmarks(libraryItems.filter((item) => item._id !== itemId));
      toast.success("Xóa mục thư viện thành công!");
    } catch (err) {
      toast.error(
        "Xóa mục thư viện thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  // Xử lý bình luận
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    try {
      await deleteComment(commentId);
      setComments(comments.filter((comment) => comment._id !== commentId));
      toast.success("Xóa bình luận thành công!");
    } catch (err) {
      toast.error(
        "Xóa bình luận thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  // Xử lý hỏi đáp
  const handleAnswerQuestion = async (questionId, answer) => {
    try {
      const response = await answerQuestion(questionId, { answer });
      setQuestions(
        questions.map((q) =>
          q._id === questionId ? response.data.question : q
        )
      );
      toast.success("Trả lời câu hỏi thành công!");
    } catch (err) {
      toast.error(
        "Trả lời câu hỏi thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  // Xử lý thống kê
  const handleStatsPeriodChange = (e) => {
    setStatsPeriod(e.target.value);
  };

  // Xử lý tìm kiếm và lọc
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleTagFilterChange = (e) => {
    setFilterTag(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (e) => {
    setFilterDate(e.target.value);
    setCurrentPage(1);
  };

  // Xử lý phân trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Lọc dữ liệu theo tìm kiếm, trạng thái, tag và ngày
  const getFilteredData = (data, type) => {
    let filteredData = [...data];

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      switch (type) {
        case "users":
          filteredData = filteredData.filter(
            (item) =>
              item.username?.toLowerCase().includes(searchLower) ||
              item.email?.toLowerCase().includes(searchLower)
          );
          break;
        case "courses":
        case "exams":
        case "news":
        case "documents":
        case "comments":
        case "questions":
          filteredData = filteredData.filter(
            (item) =>
              item.title?.toLowerCase().includes(searchLower) ||
              item.description?.toLowerCase().includes(searchLower) ||
              item.content?.toLowerCase().includes(searchLower)
          );
          break;
        case "library":
          filteredData = filteredData.filter((item) =>
            item.title?.toLowerCase().includes(searchLower)
          );
          break;
        default:
          break;
      }
    }

    // Lọc theo trạng thái
    if (
      filterStatus !== "all" &&
      ["courses", "exams", "news", "documents", "questions"].includes(type)
    ) {
      filteredData = filteredData.filter(
        (item) => item.status === filterStatus
      );
    }

    // Lọc theo tag (chỉ áp dụng cho tin tức)
    if (filterTag && type === "news") {
      filteredData = filteredData.filter((item) =>
        item.tags?.includes(filterTag)
      );
    }

    // Lọc theo ngày
    if (filterDate && ["news", "comments", "questions"].includes(type)) {
      const startDate = new Date();
      if (filterDate === "week") startDate.setDate(startDate.getDate() - 7);
      else if (filterDate === "month")
        startDate.setDate(startDate.getDate() - 30);
      else if (filterDate === "year")
        startDate.setDate(startDate.getDate() - 365);

      filteredData = filteredData.filter(
        (item) => new Date(item.createdAt) >= startDate
      );
    }

    return filteredData;
  };

  // Phân trang dữ liệu
  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Tạo dữ liệu biểu đồ
  const createChartData = () => {
    if (!detailedStats || !newsStats) return null;

    const newUsersData = {
      labels: detailedStats.newUsers.map((item) => item.date),
      datasets: [
        {
          label: "Người dùng mới",
          data: detailedStats.newUsers.map((item) => item.count),
          borderColor: "rgba(255, 111, 97, 1)",
          backgroundColor: "rgba(255, 111, 97, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    };

    const activitiesData = {
      labels: detailedStats.activities.map((item) => item.date),
      datasets: [
        {
          label: "Hoạt động",
          data: detailedStats.activities.map((item) => item.count),
          borderColor: "rgba(153, 102, 255, 1)",
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    };

    const contentDistributionData = {
      labels: ["Khóa học", "Đề thi", "Tài liệu", "Tin tức", "Bài đăng"],
      datasets: [
        {
          data: [
            stats.totalCourses,
            stats.totalExams,
            stats.totalDocuments,
            stats.totalNews,
            stats.totalPosts,
          ],
          backgroundColor: [
            "rgba(255, 111, 97, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
          ],
          borderWidth: 1,
        },
      ],
    };

    const newsViewsData = {
      labels: newsStats.viewsByCategory.map((item) => item.category),
      datasets: [
        {
          label: "Lượt xem",
          data: newsStats.viewsByCategory.map((item) => item.views),
          backgroundColor: [
            "rgba(255, 111, 97, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
          ],
          borderColor: [
            "rgba(255, 111, 97, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    return {
      newUsersData,
      activitiesData,
      contentDistributionData,
      newsViewsData,
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: { y: { beginAtZero: true } },
  };

  // Kiểm tra quyền truy cập
  if (!user || user.role !== "admin") {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <i className="fas fa-lock access-denied-icon"></i>
          <h2>Không có quyền truy cập</h2>
          <p>Bạn không có quyền truy cập trang quản trị hệ thống.</p>
          <a href="/" className="back-home-btn">
            Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }

  if (loading && isInitialLoad) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error && isInitialLoad) {
    return (
      <div className="admin-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h2>Đã xảy ra lỗi</h2>
        <p>{error}</p>
        <button onClick={fetchData} className="retry-btn">
          Thử lại
        </button>
      </div>
    );
  }

  const chartData = createChartData();

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <i className="fas fa-cogs"></i>
          <h2>Quản trị hệ thống</h2>
        </div>
        <ul className="admin-menu">
          <li
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Tổng quan</span>
          </li>
          <li
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            <i className="fas fa-users"></i>
            <span>Quản lý người dùng</span>
          </li>
          <li
            className={activeTab === "courses" ? "active" : ""}
            onClick={() => setActiveTab("courses")}
          >
            <i className="fas fa-graduation-cap"></i>
            <span>Quản lý khóa học</span>
          </li>
          <li
            className={activeTab === "exams" ? "active" : ""}
            onClick={() => setActiveTab("exams")}
          >
            <i className="fas fa-file-alt"></i>
            <span>Quản lý đề thi</span>
          </li>
          <li
            className={activeTab === "news" ? "active" : ""}
            onClick={() => setActiveTab("news")}
          >
            <i className="fas fa-newspaper"></i>
            <span>Quản lý tin tức</span>
          </li>
          <li
            className={activeTab === "documents" ? "active" : ""}
            onClick={() => setActiveTab("documents")}
          >
            <i className="fas fa-book"></i>
            <span>Quản lý tài liệu</span>
          </li>
          {/* <li
            className={activeTab === "library" ? "active" : ""}
            onClick={() => setActiveTab("library")}
          >
            <i className="fas fa-bookmark"></i>
            <span>Quản lý thư viện</span>
          </li> */}
          <li
            className={activeTab === "comments" ? "active" : ""}
            onClick={() => setActiveTab("comments")}
          >
            <i className="fas fa-comments"></i>
            <span>Quản lý bình luận</span>
          </li>
          <li
            className={activeTab === "questions" ? "active" : ""}
            onClick={() => setActiveTab("questions")}
          >
            <i className="fas fa-question-circle"></i>
            <span>Hỏi đáp Toán học</span>
          </li>
        </ul>
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <img
              src={
                user.avatar ||
                "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png"
              }
              alt="Admin avatar"
              className="admin-avatar"
              onError={(e) => {
                e.target.src =
                  "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png";
              }}
            />
            <div>
              <p className="admin-username">{user.username}</p>
              <p className="admin-role">Quản trị viên</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Tổng quan */}
        {activeTab === "dashboard" && (
          <div className="dashboard-tab">
            <div className="admin-header">
              <h2>Tổng quan hệ thống</h2>
              <div className="admin-actions">
                <select
                  value={statsPeriod}
                  onChange={handleStatsPeriodChange}
                  className="period-selector"
                >
                  <option value="week">7 ngày qua</option>
                  <option value="month">30 ngày qua</option>
                  <option value="year">365 ngày qua</option>
                </select>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon users-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                  <h3>Người dùng</h3>
                  <p className="stat-value">{stats.totalUsers || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon courses-icon">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <div className="stat-info">
                  <h3>Khóa học</h3>
                  <p className="stat-value">{stats.totalCourses || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon exams-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="stat-info">
                  <h3>Đề thi</h3>
                  <p className="stat-value">{stats.totalExams || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon documents-icon">
                  <i className="fas fa-book"></i>
                </div>
                <div className="stat-info">
                  <h3>Tài liệu</h3>
                  <p className="stat-value">{stats.totalDocuments || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon news-icon">
                  <i className="fas fa-newspaper"></i>
                </div>
                <div className="stat-info">
                  <h3>Tin tức</h3>
                  <p className="stat-value">{stats.totalNews || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon posts-icon">
                  <i className="fas fa-comments"></i>
                </div>
                <div className="stat-info">
                  <h3>Bài đăng</h3>
                  <p className="stat-value">{stats.totalPosts || 0}</p>
                </div>
              </div>
            </div>

            {chartData && (
              <div className="charts-container">
                <div className="chart-wrapper">
                  <h3>Người dùng mới</h3>
                  <div className="chart">
                    <Line
                      data={chartData.newUsersData}
                      options={chartOptions}
                    />
                  </div>
                </div>
                <div className="chart-wrapper">
                  <h3>Hoạt động</h3>
                  <div className="chart">
                    <Bar
                      data={chartData.activitiesData}
                      options={chartOptions}
                    />
                  </div>
                </div>
                <div className="chart-wrapper">
                  <h3>Phân phối nội dung</h3>
                  <div className="chart donut-chart">
                    <Doughnut
                      data={chartData.contentDistributionData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "right" } },
                      }}
                    />
                  </div>
                </div>
                <div className="chart-wrapper">
                  <h3>Lượt xem tin tức theo danh mục</h3>
                  <div className="chart">
                    <Bar
                      data={chartData.newsViewsData}
                      options={chartOptions}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quản lý người dùng */}
        {activeTab === "users" && (
          <div className="users-tab">
            <div className="admin-header">
              <h2>Quản lý người dùng</h2>
              <div className="admin-actions">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                </div>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-indicator">
                <div className="spinner-sm"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Tên người dùng</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(getFilteredData(users, "users")).map(
                        (u) => (
                          <tr key={u._id}>
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>
                              <select
                                value={u.role}
                                onChange={(e) =>
                                  handleUpdateUserRole(u._id, e.target.value)
                                }
                                disabled={u._id === user._id}
                                className="role-select"
                              >
                                <option value="student">Học sinh</option>
                                <option value="teacher">Giáo viên</option>
                                <option value="admin">Quản trị viên</option>
                              </select>
                            </td>
                            <td>
                              {new Date(u.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td>
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                disabled={u._id === user._id}
                                className="delete-btn"
                                title="Xóa người dùng"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {getFilteredData(users, "users").length === 0 && (
                  <div className="no-data">
                    <i className="fas fa-search"></i>
                    <p>Không tìm thấy người dùng nào</p>
                  </div>
                )}

                {getFilteredData(users, "users").length > itemsPerPage && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>
                    <span className="pagination-info">
                      Trang {currentPage} /{" "}
                      {Math.ceil(
                        getFilteredData(users, "users").length / itemsPerPage
                      )}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(users, "users").length / itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.ceil(
                            getFilteredData(users, "users").length /
                              itemsPerPage
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(users, "users").length / itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Quản lý khóa học */}
        {activeTab === "courses" && (
          <div className="courses-tab">
            <div className="admin-header">
              <h2>Quản lý khóa học</h2>
              <div className="admin-actions">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Tìm kiếm khóa học..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <select
                    value={filterStatus}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                  </select>
                </div>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-indicator">
                <div className="spinner-sm"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Tiêu đề</th>
                        <th>Tác giả</th>
                        <th>Giá</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(
                        getFilteredData(courses, "courses")
                      ).map((course) => (
                        <tr key={course._id}>
                          <td>{course.title}</td>
                          <td>{course.author?.username || "Không xác định"}</td>
                          <td>
                            {course.price
                              ? `${course.price.toLocaleString("vi-VN")} VND`
                              : "Miễn phí"}
                          </td>
                          <td>
                            <span
                              className={`status-badge status-${course.status}`}
                            >
                              {course.status === "pending"
                                ? "Chờ duyệt"
                                : course.status === "approved"
                                ? "Đã duyệt"
                                : "Bị từ chối"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              {course.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleApproveCourse(course._id)
                                    }
                                    className="approve-btn"
                                    title="Duyệt khóa học"
                                  >
                                    <i className="fas fa-check"></i>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectCourse(course._id)
                                    }
                                    className="reject-btn"
                                    title="Từ chối khóa học"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteCourse(course._id)}
                                className="delete-btn"
                                title="Xóa khóa học"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredData(courses, "courses").length === 0 && (
                  <div className="no-data">
                    <i className="fas fa-search"></i>
                    <p>Không tìm thấy khóa học nào</p>
                  </div>
                )}

                {getFilteredData(courses, "courses").length > itemsPerPage && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>
                    <span className="pagination-info">
                      Trang {currentPage} /{" "}
                      {Math.ceil(
                        getFilteredData(courses, "courses").length /
                          itemsPerPage
                      )}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(courses, "courses").length /
                            itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.ceil(
                            getFilteredData(courses, "courses").length /
                              itemsPerPage
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(courses, "courses").length /
                            itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Quản lý đề thi */}
        {activeTab === "exams" && (
          <div className="exams-tab">
            <div className="admin-header">
              <h2>Quản lý đề thi</h2>
              <div className="admin-actions">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Tìm kiếm đề thi..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <select
                    value={filterStatus}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                  </select>
                </div>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-indicator">
                <div className="spinner-sm"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Tiêu đề</th>
                        <th>Tác giả</th>
                        <th>Cấp học</th>
                        <th>Môn học</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(getFilteredData(exams, "exams")).map(
                        (exam) => (
                          <tr key={exam._id}>
                            <td>{exam.title}</td>
                            <td>{exam.author?.username || "Không xác định"}</td>
                            <td>
                              {exam.educationLevel === "university"
                                ? "Đại học"
                                : `Lớp ${exam.educationLevel.replace(
                                    "grade",
                                    ""
                                  )}`}
                            </td>
                            <td>
                              {exam.subject === "math" ? "Toán" : exam.subject}
                            </td>
                            <td>
                              <span
                                className={`status-badge status-${exam.status}`}
                              >
                                {exam.status === "pending"
                                  ? "Chờ duyệt"
                                  : exam.status === "approved"
                                  ? "Đã duyệt"
                                  : "Bị từ chối"}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                {exam.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleApproveExam(exam._id)
                                      }
                                      className="approve-btn"
                                      title="Duyệt đề thi"
                                    >
                                      <i className="fas fa-check"></i>
                                    </button>
                                    <button
                                      onClick={() => handleRejectExam(exam._id)}
                                      className="reject-btn"
                                      title="Từ chối đề thi"
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDeleteExam(exam._id)}
                                  className="delete-btn"
                                  title="Xóa đề thi"
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {getFilteredData(exams, "exams").length === 0 && (
                  <div className="no-data">
                    <i className="fas fa-search"></i>
                    <p>Không tìm thấy đề thi nào</p>
                  </div>
                )}

                {getFilteredData(exams, "exams").length > itemsPerPage && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>
                    <span className="pagination-info">
                      Trang {currentPage} /{" "}
                      {Math.ceil(
                        getFilteredData(exams, "exams").length / itemsPerPage
                      )}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(exams, "exams").length / itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.ceil(
                            getFilteredData(exams, "exams").length /
                              itemsPerPage
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(exams, "exams").length / itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Quản lý tin tức */}
        {activeTab === "news" && (
          <div className="news-tab">
            <div className="admin-header">
              <h2>Quản lý tin tức</h2>
              <div className="admin-actions">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Tìm kiếm tin tức..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <select
                    value={filterStatus}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                  </select>
                  <select
                    value={filterTag}
                    onChange={handleTagFilterChange}
                    className="filter-select"
                  >
                    <option value="">Tất cả tags</option>
                    <option value="math">Toán học</option>
                    <option value="education">Giáo dục</option>
                    <option value="science">Khoa học</option>
                    <option value="competitions">Kỳ thi</option>
                  </select>
                  <select
                    value={filterDate}
                    onChange={handleDateFilterChange}
                    className="filter-select"
                  >
                    <option value="">Tất cả thời gian</option>
                    <option value="week">7 ngày qua</option>
                    <option value="month">30 ngày qua</option>
                    <option value="year">365 ngày qua</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowCreateNews(true)}
                  className="refresh-btn"
                >
                  <i className="fas fa-plus"></i> Tạo tin tức
                </button>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-indicator">
                <div className="spinner-sm"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Tiêu đề</th>
                        <th>Tác giả</th>
                        <th>Danh mục</th>
                        <th>Tags</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(getFilteredData(news, "news")).map(
                        (item) => (
                          <tr key={item._id}>
                            <td>{item.title}</td>
                            <td>{item.author?.username || "Không xác định"}</td>
                            <td>
                              {item.category === "education"
                                ? "Giáo dục"
                                : item.category === "math-magazine"
                                ? "Tạp chí Toán"
                                : item.category === "science"
                                ? "Khoa học"
                                : "Kỳ thi"}
                            </td>
                            <td>{item.tags?.join(", ") || "Không có"}</td>
                            <td>
                              <span
                                className={`status-badge status-${item.status}`}
                              >
                                {item.status === "pending"
                                  ? "Chờ duyệt"
                                  : item.status === "approved"
                                  ? "Đã duyệt"
                                  : "Bị từ chối"}
                              </span>
                            </td>
                            <td>
                              {new Date(item.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  onClick={() => {
                                    setShowEditNews(item);
                                    setFormData({
                                      title: item.title,
                                      content: item.content,
                                      summary: item.summary,
                                      category: item.category,
                                      tags: item.tags?.join(", ") || "",
                                      image: null,
                                      pdfFile: null,
                                      issueNumber: item.issueNumber || "",
                                      year: item.year || "",
                                    });
                                  }}
                                  className="edit-btn"
                                  title="Chỉnh sửa tin tức"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                {item.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleApproveNews(item._id)
                                      }
                                      className="approve-btn"
                                      title="Duyệt tin tức"
                                    >
                                      <i className="fas fa-check"></i>
                                    </button>
                                    <button
                                      onClick={() => handleRejectNews(item._id)}
                                      className="reject-btn"
                                      title="Từ chối tin tức"
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDeleteNews(item._id)}
                                  className="delete-btn"
                                  title="Xóa tin tức"
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {getFilteredData(news, "news").length === 0 && (
                  <div className="no-data">
                    <i className="fas fa-search"></i>
                    <p>Không tìm thấy tin tức nào</p>
                  </div>
                )}

                {getFilteredData(news, "news").length > itemsPerPage && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>
                    <span className="pagination-info">
                      Trang {currentPage} /{" "}
                      {Math.ceil(
                        getFilteredData(news, "news").length / itemsPerPage
                      )}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(news, "news").length / itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.ceil(
                            getFilteredData(news, "news").length / itemsPerPage
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(news, "news").length / itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Modal tạo tin tức */}
            {showCreateNews && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Tạo Tin Tức Mới</h2>
                  <form onSubmit={handleCreateNews}>
                    <input
                      type="text"
                      name="title"
                      placeholder="Tiêu đề"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                    <textarea
                      name="content"
                      placeholder="Nội dung"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      required
                    />
                    <textarea
                      name="summary"
                      placeholder="Tóm tắt"
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                    />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option value="education">Giáo dục</option>
                      <option value="math-magazine">Tạp chí Toán</option>
                      <option value="science">Khoa học</option>
                      <option value="competitions">Kỳ thi</option>
                    </select>
                    <input
                      type="text"
                      name="tags"
                      placeholder="Tags (phân cách bởi dấu phẩy)"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                    />
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.files[0] })
                      }
                    />
                    {formData.category === "math-magazine" && (
                      <>
                        <input
                          type="file"
                          name="pdfFile"
                          accept="application/pdf"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pdfFile: e.target.files[0],
                            })
                          }
                          required
                        />
                        <input
                          type="number"
                          name="issueNumber"
                          placeholder="Số kỳ"
                          value={formData.issueNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              issueNumber: e.target.value,
                            })
                          }
                          required
                        />
                        <input
                          type="number"
                          name="year"
                          placeholder="Năm"
                          value={formData.year}
                          onChange={(e) =>
                            setFormData({ ...formData, year: e.target.value })
                          }
                          required
                        />
                      </>
                    )}
                    <div className="modal-actions">
                      <button type="submit">Tạo Tin Tức</button>
                      <button
                        type="button"
                        onClick={() => setShowCreateNews(false)}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal chỉnh sửa tin tức */}
            {showEditNews && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Chỉnh Sửa Tin Tức</h2>
                  <form onSubmit={handleEditNews}>
                    <input
                      type="text"
                      name="title"
                      placeholder="Tiêu đề"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                    <textarea
                      name="content"
                      placeholder="Nội dung"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      required
                    />
                    <textarea
                      name="summary"
                      placeholder="Tóm tắt"
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                    />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option value="education">Giáo dục</option>
                      <option value="math-magazine">Tạp chí Toán</option>
                      <option value="science">Khoa học</option>
                      <option value="competitions">Kỳ thi</option>
                    </select>
                    <input
                      type="text"
                      name="tags"
                      placeholder="Tags (phân cách bởi dấu phẩy)"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                    />
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.files[0] })
                      }
                    />
                    {formData.category === "math-magazine" && (
                      <>
                        <input
                          type="file"
                          name="pdfFile"
                          accept="application/pdf"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pdfFile: e.target.files[0],
                            })
                          }
                        />
                        <input
                          type="number"
                          name="issueNumber"
                          placeholder="Số kỳ"
                          value={formData.issueNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              issueNumber: e.target.value,
                            })
                          }
                          required
                        />
                        <input
                          type="number"
                          name="year"
                          placeholder="Năm"
                          value={formData.year}
                          onChange={(e) =>
                            setFormData({ ...formData, year: e.target.value })
                          }
                          required
                        />
                      </>
                    )}
                    <div className="modal-actions">
                      <button type="submit">Cập nhật Tin Tức</button>
                      <button
                        type="button"
                        onClick={() => setShowEditNews(null)}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quản lý tài liệu */}
        {activeTab === "documents" && (
          <div className="documents-tab">
            <div className="admin-header">
              <h2>Quản lý tài liệu</h2>
              <div className="admin-actions">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Tìm kiếm tài liệu..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <select
                    value={filterStatus}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                  </select>
                </div>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-indicator">
                <div className="spinner-sm"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Tiêu đề</th>
                        <th>Người tải lên</th>
                        <th>Cấp học</th>
                        <th>Loại tài liệu</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(
                        getFilteredData(documents, "documents")
                      ).map((doc) => (
                        <tr key={doc._id}>
                          <td>{doc.title}</td>
                          <td>
                            {doc.uploadedBy?.username || "Không xác định"}
                          </td>
                          <td>
                            {doc.educationLevel === "primary"
                              ? "Tiểu học"
                              : doc.educationLevel === "secondary"
                              ? "THCS"
                              : doc.educationLevel === "high"
                              ? "THPT"
                              : "Đại học"}
                          </td>
                          <td>{doc.documentType}</td>
                          <td>
                            <span
                              className={`status-badge status-${doc.status}`}
                            >
                              {doc.status === "pending"
                                ? "Chờ duyệt"
                                : doc.status === "approved"
                                ? "Đã duyệt"
                                : "Bị từ chối"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              {doc.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleApproveDocument(doc._id)
                                    }
                                    className="approve-btn"
                                    title="Duyệt tài liệu"
                                  >
                                    <i className="fas fa-check"></i>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectDocument(doc._id)
                                    }
                                    className="reject-btn"
                                    title="Từ chối tài liệu"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteDocument(doc._id)}
                                className="delete-btn"
                                title="Xóa tài liệu"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredData(documents, "documents").length === 0 && (
                  <div className="no-data">
                    <i className="fas fa-search"></i>
                    <p>Không tìm thấy tài liệu nào</p>
                  </div>
                )}

                {getFilteredData(documents, "documents").length >
                  itemsPerPage && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>
                    <span className="pagination-info">
                      Trang {currentPage} /{" "}
                      {Math.ceil(
                        getFilteredData(documents, "documents").length /
                          itemsPerPage
                      )}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(documents, "documents").length /
                            itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.ceil(
                            getFilteredData(documents, "documents").length /
                              itemsPerPage
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(documents, "documents").length /
                            itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Quản lý thư viện */}
        {/* {activeTab === "library" && (
          <div className="library-tab">
            <div className="admin-header">
              <h2>Quản lý thư viện</h2>
              <div className="admin-actions">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Tìm kiếm mục thư viện..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                </div>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-indicator">
                <div className="spinner-sm"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Tiêu đề</th>
                        <th>Loại</th>
                        <th>Người dùng</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(
                        getFilteredData(libraryItems, "library")
                      ).map((item) => (
                        <tr key={item._id}>
                          <td>{item.title}</td>
                          <td>
                            {item.type === "document" ? "Tài liệu" : "Tin tức"}
                          </td>
                          <td>{item.user?.username || "Không xác định"}</td>
                          <td>
                            {new Date(item.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => handleDeleteBookmark(item._id)}
                              className="delete-btn"
                              title="Xóa mục thư viện"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredData(libraryItems, "library").length === 0 && (
                  <div className="no-data">
                    <i className="fas fa-search"></i>
                    <p>Không tìm thấy mục thư viện nào</p>
                  </div>
                )}

                {getFilteredData(libraryItems, "library").length >
                  itemsPerPage && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>
                    <span className="pagination-info">
                      Trang {currentPage} /{" "}
                      {Math.ceil(
                        getFilteredData(libraryItems, "library").length /
                          itemsPerPage
                      )}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(libraryItems, "library").length /
                            itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.ceil(
                            getFilteredData(libraryItems, "library").length /
                              itemsPerPage
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(libraryItems, "library").length /
                            itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )} */}

        {/* Quản lý bình luận */}
        {activeTab === "comments" && (
          <div className="comments-tab">
            <div className="admin-header">
              <h2>Quản lý bình luận</h2>
              <div className="admin-actions">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Tìm kiếm bình luận..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <select
                    value={filterDate}
                    onChange={handleDateFilterChange}
                    className="filter-select"
                  >
                    <option value="">Tất cả thời gian</option>
                    <option value="week">7 ngày qua</option>
                    <option value="month">30 ngày qua</option>
                    <option value="year">365 ngày qua</option>
                  </select>
                </div>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-indicator">
                <div className="spinner-sm"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Nội dung</th>
                        <th>Tác giả</th>
                        <th>Tham chiếu</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(
                        getFilteredData(comments, "comments")
                      ).map((comment) => (
                        <tr key={comment._id}>
                          <td>{comment.content}</td>
                          <td>
                            {comment.author?.username || "Không xác định"}
                          </td>
                          <td>
                            {comment.referenceType === "article"
                              ? "Tin tức"
                              : "Khác"}
                            : {comment.referenceId}
                          </td>
                          <td>
                            {new Date(comment.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="delete-btn"
                              title="Xóa bình luận"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredData(comments, "comments").length === 0 && (
                  <div className="no-data">
                    <i className="fas fa-search"></i>
                    <p>Không tìm thấy bình luận nào</p>
                  </div>
                )}

                {getFilteredData(comments, "comments").length >
                  itemsPerPage && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>
                    <span className="pagination-info">
                      Trang {currentPage} /{" "}
                      {Math.ceil(
                        getFilteredData(comments, "comments").length /
                          itemsPerPage
                      )}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(comments, "comments").length /
                            itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.ceil(
                            getFilteredData(comments, "comments").length /
                              itemsPerPage
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(comments, "comments").length /
                            itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Hỏi đáp Toán học */}
        {activeTab === "questions" && (
          <div className="questions-tab">
            <div className="admin-header">
              <h2>Hỏi đáp Toán học</h2>
              <div className="admin-actions">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Tìm kiếm câu hỏi..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <select
                    value={filterStatus}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chưa trả lời</option>
                    <option value="answered">Đã trả lời</option>
                  </select>
                  <select
                    value={filterDate}
                    onChange={handleDateFilterChange}
                    className="filter-select"
                  >
                    <option value="">Tất cả thời gian</option>
                    <option value="week">7 ngày qua</option>
                    <option value="month">30 ngày qua</option>
                    <option value="year">365 ngày qua</option>
                  </select>
                </div>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-indicator">
                <div className="spinner-sm"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Câu hỏi</th>
                        <th>Tác giả</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(
                        getFilteredData(questions, "questions")
                      ).map((question) => (
                        <tr key={question._id}>
                          <td>{question.content}</td>
                          <td>
                            {question.author?.username || "Không xác định"}
                          </td>
                          <td>
                            <span
                              className={`status-badge status-${question.status}`}
                            >
                              {question.status === "pending"
                                ? "Chưa trả lời"
                                : "Đã trả lời"}
                            </span>
                          </td>
                          <td>
                            {new Date(question.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              {question.status === "pending" && (
                                <button
                                  onClick={() => {
                                    const answer = prompt("Nhập câu trả lời:");
                                    if (answer)
                                      handleAnswerQuestion(
                                        question._id,
                                        answer
                                      );
                                  }}
                                  className="approve-btn"
                                  title="Trả lời câu hỏi"
                                >
                                  <i className="fas fa-comment"></i>
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  handleDeleteComment(question._id)
                                }
                                className="delete-btn"
                                title="Xóa câu hỏi"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredData(questions, "questions").length === 0 && (
                  <div className="no-data">
                    <i className="fas fa-search"></i>
                    <p>Không tìm thấy câu hỏi nào</p>
                  </div>
                )}

                {getFilteredData(questions, "questions").length >
                  itemsPerPage && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>
                    <span className="pagination-info">
                      Trang {currentPage} /{" "}
                      {Math.ceil(
                        getFilteredData(questions, "questions").length /
                          itemsPerPage
                      )}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(questions, "questions").length /
                            itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.ceil(
                            getFilteredData(questions, "questions").length /
                              itemsPerPage
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(questions, "questions").length /
                            itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
