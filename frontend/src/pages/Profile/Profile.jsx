"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  getUserProfile,
  getFollowers,
  getFollowing,
  getLibrary,
  getPosts,
  getScores,
  getContributions,
} from "../../services/userService";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";
import { createCourse } from "../../services/courseService";
import {
  createExam,
  getMyExams,
  updateExam,
  deleteExam,
} from "../../services/examService";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Spinner from "../../components/ui/Spinner";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import Skeleton from "../../components/ui/Skeleton";
import "./Profile.css";

// Lazy load tabs
const OverviewTab = lazy(() => import("./OverviewTab"));
const StatsTab = lazy(() => import("./StatsTab"));
const LibraryTab = lazy(() => import("./LibraryTab"));
const FriendsTab = lazy(() => import("./FriendsTab"));
const PostsTab = lazy(() => import("./PostsTab"));
const CoursesTab = lazy(() => import("./CoursesTab"));
const CreateExamTab = lazy(() => import("./CreateExamTab"));

const Profile = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [libraryItems, setLibraryItems] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [courses, setCourses] = useState([]);
  const [scores, setScores] = useState([]);
  const [participatedExams, setParticipatedExams] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [myExams, setMyExams] = useState([]);
  const [friendsFilter, setFriendsFilter] = useState("followers");
  const [friendsSearchQuery, setFriendsSearchQuery] = useState("");
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    price: 0,
    isPublic: true,
  });
  const [newExam, setNewExam] = useState({
    title: "",
    description: "",
    educationLevel: "grade1",
    subject: "math",
    duration: 60,
    questions: [],
    startTime: "",
    endTime: "",
    difficulty: "easy",
  });
  const [editingExam, setEditingExam] = useState(null);

  const navigate = useNavigate();
  const isCurrentUser = !id || (user && user._id === id);
  const profileId = id || (user ? user._id : null);

  useEffect(() => {
    if (!profileId) {
      navigate("/auth/login");
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);

        // Parallel fetching
        const [
          profileResponse,
          followersResponse,
          followingResponse,
          libraryResponse,
          postsResponse,
          notificationsResponse,
          scoresResponse,
          contributionsResponse,
          examsResponse,
        ] = await Promise.all([
          getUserProfile(profileId).catch(() => ({
            user: {
              _id: profileId,
              username: user?.username || "Người dùng",
              email: user?.email || "user@example.com",
              role: user?.role || "student",
              bio: "Thông tin hồ sơ đang được cập nhật...",
              createdAt: new Date().toISOString(),
            },
          })),
          isCurrentUser
            ? getFollowers().catch(() => ({ followers: [] }))
            : Promise.resolve({ followers: [] }),
          isCurrentUser
            ? getFollowing().catch(() => ({ following: [] }))
            : Promise.resolve({ following: [] }),
          isCurrentUser
            ? getLibrary().catch(() => ({ items: [] }))
            : Promise.resolve({ items: [] }),
          isCurrentUser
            ? getPosts().catch(() => ({ posts: [] }))
            : Promise.resolve({ posts: [] }),
          isCurrentUser
            ? getNotifications(user._id).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
          isCurrentUser && user?.role === "student"
            ? getScores().catch(() => ({ scores: [], exams: [] }))
            : Promise.resolve({ scores: [], exams: [] }),
          isCurrentUser
            ? getContributions().catch(() => ({ contributions: [] }))
            : Promise.resolve({ contributions: [] }),
          isCurrentUser && user?.role === "teacher"
            ? getMyExams().catch(() => ({ exams: [] }))
            : Promise.resolve({ exams: [] }),
        ]);

        setProfile(profileResponse.user || profileResponse);
        setFollowers(followersResponse.followers || []);
        setFollowing(followingResponse.following || []);
        setLibraryItems(libraryResponse.items || []);
        setPosts(postsResponse.posts || []);
        setNotifications(notificationsResponse.data || []);
        setUnreadNotificationsCount(
          notificationsResponse.data.filter((n) => !n.isRead).length || 0
        );
        setScores(scoresResponse.scores || []);
        setParticipatedExams(scoresResponse.exams || []);
        setContributions(contributionsResponse.contributions || []);
        setMyExams(examsResponse.exams || []);

        setError(null);
      } catch (err) {
        setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.");
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profileId, navigate, isCurrentUser, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadNotificationsCount((prev) => prev - 1);
      toast.success("Đã đánh dấu thông báo là đã đọc");
    } catch (err) {
      toast.error("Không thể cập nhật thông báo");
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title) {
      toast.error("Vui lòng nhập tiêu đề khóa học");
      return;
    }

    try {
      const response = await createCourse(newCourse);
      setCourses([response.data, ...courses]);
      setNewCourse({
        title: "",
        description: "",
        price: 0,
        isPublic: true,
      });
      toast.success("Tạo khóa học thành công! Đang chờ duyệt.");
    } catch (err) {
      toast.error(
        "Không thể tạo khóa học: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!newExam.title || !newExam.startTime || !newExam.endTime) {
      toast.error("Vui lòng điền đầy đủ thông tin đề thi");
      return;
    }

    try {
      const response = await createExam(newExam);
      setMyExams([response.data, ...myExams]);
      setNewExam({
        title: "",
        description: "",
        educationLevel: "grade1",
        subject: "math",
        duration: 60,
        questions: [],
        startTime: "",
        endTime: "",
        difficulty: "easy",
      });
      toast.success("Tạo đề thi thành công! Đang chờ duyệt.");
    } catch (err) {
      toast.error(
        "Không thể tạo đề thi: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    if (!editingExam || !newExam.title) {
      toast.error("Vui lòng điền đầy đủ thông tin đề thi");
      return;
    }

    try {
      const response = await updateExam(editingExam, newExam);
      setMyExams(
        myExams.map((exam) => (exam._id === editingExam ? response.data : exam))
      );
      setEditingExam(null);
      setNewExam({
        title: "",
        description: "",
        educationLevel: "grade1",
        subject: "math",
        duration: 60,
        questions: [],
        startTime: "",
        endTime: "",
        difficulty: "easy",
      });
      toast.success("Cập nhật đề thi thành công!");
    } catch (err) {
      toast.error(
        "Không thể cập nhật đề thi: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleEditClick = (exam) => {
    setEditingExam(exam._id);
    setNewExam({
      title: exam.title,
      description: exam.description || "",
      educationLevel: exam.educationLevel || "grade1",
      subject: exam.subject || "math",
      duration: exam.duration || 60,
      questions: exam.questions || [],
      startTime: exam.startTime
        ? new Date(exam.startTime).toISOString().slice(0, 16)
        : "",
      endTime: exam.endTime
        ? new Date(exam.endTime).toISOString().slice(0, 16)
        : "",
      difficulty: exam.difficulty || "easy",
    });
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đề thi này?")) return;

    try {
      await deleteExam(examId);
      setMyExams(myExams.filter((exam) => exam._id !== examId));
      toast.success("Xóa đề thi thành công!");
    } catch (err) {
      toast.error(
        "Không thể xóa đề thi: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Skeleton type="profile" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <i className="fas fa-exclamation-circle error-icon"></i>
          <h2>Không thể tải thông tin hồ sơ</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            <i className="fas fa-sync-alt"></i> Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="error-container">
        <div className="error-content">
          <i className="fas fa-user-slash error-icon"></i>
          <h2>Không tìm thấy hồ sơ</h2>
          <p>
            Hồ sơ người dùng không tồn tại hoặc bạn không có quyền truy cập.
          </p>
          <button onClick={() => navigate("/")} className="home-button">
            <i className="fas fa-home"></i> Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="profile-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-header">
        <div className="profile-cover">
          <img
            src={
              profile.coverImage ||
              "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934942/4_fpzzq2.png"
            }
            alt="Cover"
            className="cover-image"
            onError={(e) => {
              e.target.src =
                "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934942/4_fpzzq2.png";
            }}
          />
          <div className="cover-overlay"></div>
        </div>
        <div className="profile-info">
          <div className="profile-avatar">
            <img
              src={
                profile.avatar ||
                "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png"
              }
              alt={profile.username}
              onError={(e) => {
                e.target.src =
                  "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png";
              }}
            />
          </div>
          <div className="profile-details">
            <h1>{profile.username}</h1>
            <p className="profile-role">
              {profile.role === "student"
                ? "Học sinh"
                : profile.role === "teacher"
                ? "Giáo viên"
                : "Quản trị viên"}
            </p>
            <p className="profile-bio">
              {profile.bio || "Chưa có thông tin giới thiệu"}
            </p>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{followers.length || 0}</span>
                <span className="stat-label">Người theo dõi</span>
              </div>
              <div className="stat">
                <span className="stat-value">{following.length || 0}</span>
                <span className="stat-label">Đang theo dõi</span>
              </div>
              <div className="stat">
                <span className="stat-value">{posts.length || 0}</span>
                <span className="stat-label">Bài viết</span>
              </div>
            </div>
            {isCurrentUser ? (
              <button className="edit-profile-btn">
                <i className="fas fa-edit"></i> Chỉnh sửa hồ sơ
              </button>
            ) : (
              <button className="follow-btn">
                <i className="fas fa-user-plus"></i> Theo dõi
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          user={profile}
          tabs="profile"
        />
        <div className="profile-tab-content">
          <ErrorBoundary>
            <Suspense fallback={<Skeleton type="tab" />}>
              {activeTab === "overview" && (
                <OverviewTab
                  profile={profile}
                  isCurrentUser={isCurrentUser}
                  contributions={contributions}
                />
              )}
              {activeTab === "stats" && profile.role === "student" && (
                <StatsTab
                  scores={scores}
                  participatedExams={participatedExams}
                />
              )}
              {activeTab === "library" && (
                <LibraryTab libraryItems={libraryItems} />
              )}
              {activeTab === "friends" && (
                <FriendsTab
                  friendsFilter={friendsFilter}
                  setFriendsFilter={setFriendsFilter}
                  friendsSearchQuery={friendsSearchQuery}
                  setFriendsSearchQuery={setFriendsSearchQuery}
                  followers={followers}
                  following={following}
                />
              )}
              {activeTab === "posts" && (
                <PostsTab
                  posts={posts}
                  notifications={notifications}
                  handleMarkNotificationRead={handleMarkNotificationRead}
                  unreadNotificationsCount={unreadNotificationsCount}
                />
              )}
              {activeTab === "courses" && (
                <CoursesTab
                  profileData={profile}
                  courses={courses}
                  newCourse={newCourse}
                  setNewCourse={setNewCourse}
                  handleCreateCourse={handleCreateCourse}
                />
              )}
              {activeTab === "create-exam" && profile.role === "teacher" && (
                <CreateExamTab
                  profileData={profile}
                  myExams={myExams}
                  newExam={newExam}
                  setNewExam={setNewExam}
                  editingExam={editingExam}
                  setEditingExam={setEditingExam}
                  handleCreateExam={handleCreateExam}
                  handleUpdateExam={handleUpdateExam}
                  handleEditClick={handleEditClick}
                  handleDeleteExam={handleDeleteExam}
                />
              )}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
