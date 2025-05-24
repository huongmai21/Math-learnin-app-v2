"use client";

import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { store } from "./redux/store";
import Navbar from "./components/layout/Navbar/Navbar";
import Footer from "./components/layout/Footer/Footer";
import Home from "./pages/Home/Home";
import Auth from "./pages/Auth/AuthForm";
import ResetPassword from "./pages/Auth/ResetPassword";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Profile from "./pages/Profile/Profile";
import DocumentList from "./pages/Document/DocumentList";
import DocumentDetail from "./pages/Document/DocumentDetail";
import CreateDocument from "./pages/Document/CreateDocument";
import RelatedDocuments from "./pages/Document/RelatedDocuments";
import NewsPage from "./pages/News/NewsPage";
import CoursePage from "./pages/Course/CoursePage";
import CourseDetail from "./pages/Course/CourseDetail";
import MyCourses from "./pages/Course/MyCourses";
import EditCourse from "./pages/Course/EditCourse";
import PaymentPage from "./pages/Course/PaymentPage";
import StudyCorner from "./pages/StudyCorner/StudyCorner";
import StudyRoom from "./pages/StudyRoom/StudyRoom";
import CreateExam from "./pages/Exams/CreateExam";
import ExamList from "./pages/Exams/ExamList";
import TakeExam from "./pages/Exams/TakeExam";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AchievementsPage from "./pages/Achievements/AchievementsPage";
import MathAIHelper from "./components/ai/MathAIHelper";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { refreshUser } from "./redux/slices/authSlice";
import Spinner from "./components/ui/Spinner";
import SearchResults from "./pages/Search/SearchResults";

const AppContent = () => {
  const dispatch = useDispatch();
  const { user, token, loading, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user) {
        try {
          await dispatch(refreshUser()).unwrap();
        } catch (error) {
          console.error("Failed to refresh user:", error);
        }
      }
      setAppReady(true);
    };

    initializeAuth();
  }, [dispatch, token, user]);

  if (!appReady) {
    return <Spinner />;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/:type" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/users/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/users/:id" element={<Profile />} />
          <Route path="/documents" element={<DocumentList />} />
          <Route
            path="/documents/grade1"
            element={<DocumentList educationLevel="primary" />}
          />
          <Route
            path="/documents/grade2"
            element={<DocumentList educationLevel="secondary" />}
          />
          <Route
            path="/documents/grade3"
            element={<DocumentList educationLevel="highschool" />}
          />
          <Route
            path="/documents/university"
            element={<DocumentList educationLevel="university" />}
          />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route
            path="/documents/create"
            element={
              <ProtectedRoute>
                <CreateDocument />
              </ProtectedRoute>
            }
          />
          <Route path="/documents/related/:id" element={<RelatedDocuments />} />
          <Route
            path="/news/education"
            element={
              <NewsPage category="education" title="Thông tin giáo dục" />
            }
          />
          <Route
            path="/news/magazine"
            element={<NewsPage category="math-magazine" title="Tạp chí Toán" />}
          />
          <Route path="/courses" element={<CoursePage />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route
            path="/courses/my-courses"
            element={
              <ProtectedRoute>
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/edit/:id"
            element={
              <ProtectedRoute>
                <EditCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:id"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route path="/exams" element={<ExamList />} />
          <Route
            path="/exams/create"
            element={
              <ProtectedRoute>
                <CreateExam />
              </ProtectedRoute>
            }
          />
          <Route path="/exams/:id" element={<TakeExam />} />
          <Route path="/study-corner" element={<StudyCorner />} />
          <Route
            path="/study-room/:id"
            element={
              <ProtectedRoute>
                <StudyRoom />
              </ProtectedRoute>
            }
          />
          <Route path="/study-room" element={<StudyRoom />} />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <AchievementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<SearchResults />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      {user && <MathAIHelper />}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
