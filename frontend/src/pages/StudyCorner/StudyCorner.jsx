"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import io from "socket.io-client";
import { Tooltip } from "react-tooltip";
import debounce from "lodash/debounce";
import {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLikePost,
  updatePostStatus,
  updateAiResponse,
  uploadPostImage,
  uploadPostFile,
} from "../../services/postService.js";
import {
  getComments,
  createComment,
  deleteComment,
  likeComment,
} from "../../services/commentService.js";
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
  checkBookmarks,
} from "../../services/bookmarkService.js";
import { askMathQuestion } from "../../services/aiService.js";
import "./StudyCorner.css";

const StudyCorner = () => {
  const { id, tab = "exercises" } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(tab);
  const [posts, setPosts] = useState([]);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [createPostLoading, setCreatePostLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchImage, setSearchImage] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    category: "exercise",
    subject: "highschool",
    status: "open",
    images: [],
    files: [],
  });

  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const MAX_FILES = 5; // Giới hạn số lượng file

  useEffect(() => {
    if (user) {
      socketRef.current = io("http://localhost:5000", {
        transports: ["websocket"],
        reconnectionAttempts: 5,
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to WebSocket");
        socketRef.current.emit("join", user._id);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
        toast.error("Không thể kết nối đến WebSocket");
      });

      socketRef.current.on("bookmark_notification", ({ message }) => {
        toast.info(message);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const loadBookmarkedPostIds = useCallback(
    async (posts) => {
      if (!user || !posts || posts.length === 0) return;

      try {
        const postIds = posts.map((post) => post._id);
        const response = await checkBookmarks("post", postIds);
        setBookmarkedPostIds(response.data || []);
      } catch (error) {
        console.error("Error checking bookmarks:", error);
        toast.error("Không thể kiểm tra bookmark");
      }
    },
    [user]
  );

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        let response;
        switch (activeTab) {
          case "exercises":
            response = await getPosts({
              page,
              category: "exercise",
              subject,
              status,
              search,
              sortBy: "createdAt",
              sortOrder: "desc",
            });
            break;
          case "learning":
            response = await getPosts({
              page,
              category: "question",
              subject,
              search,
              sortBy: "createdAt",
              sortOrder: "desc",
            });
            break;
          case "sharing":
            response = await getPosts({
              page,
              category: "share",
              search,
              sortBy: "createdAt",
              sortOrder: "desc",
            });
            break;
          case "bookmarks":
            response = await getBookmarks({
              page,
              referenceType: "post",
              search,
            });
            break;
          default:
            response = await getPosts({ page, search });
        }

        if (!response.data) {
          throw new Error("Dữ liệu bài đăng không hợp lệ");
        }

        setPosts(response.data);
        setTotalPages(response.totalPages || 1);
        if (activeTab !== "bookmarks") {
          await loadBookmarkedPostIds(response.data);
        }
      } catch (error) {
        toast.error(error.message || "Không thể tải danh sách bài đăng");
        setPosts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    if (!id) {
      loadPosts();
    }
  }, [
    activeTab,
    page,
    subject,
    status,
    search,
    id,
    user,
    loadBookmarkedPostIds,
  ]);

  useEffect(() => {
    if (id) {
      const loadPostDetails = async () => {
        setLoading(true);
        try {
          const response = await getPostById(id);
          setCurrentPost(response.data);

          if (user) {
            const bookmarkResponse = await checkBookmarks("post", [id]);
            setBookmarkedPostIds(bookmarkResponse.data || []);
          }

          loadComments(id);
        } catch (error) {
          toast.error(error.message || "Không thể tải chi tiết bài đăng");
          navigate("/study-corner");
        } finally {
          setLoading(false);
        }
      };

      loadPostDetails();
    } else {
      setCurrentPost(null);
      setComments([]);
      setBookmarkedPostIds([]);
    }
  }, [id, navigate, user]);

  const loadComments = async (postId) => {
    setCommentsLoading(true);
    try {
      const response = await getComments(postId);
      setComments(response.data);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Không thể tải bình luận");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (files.length + formData.images.length > MAX_FILES) {
      toast.error(`Bạn chỉ có thể tải lên tối đa ${MAX_FILES} hình ảnh`);
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`Hình ảnh ${file.name} vượt quá 10MB`);
        return false;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} không phải hình ảnh`);
        return false;
      }
      return true;
    });

    setCreatePostLoading(true);
    const uploadPromises = validFiles.map(async (file) => {
      try {
        const response = await uploadPostImage(file);
        return response.data.url;
      } catch (error) {
        toast.error(`Không thể tải lên hình ảnh: ${file.name}`);
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const validUrls = uploadedUrls.filter(Boolean);

    setFormData({
      ...formData,
      images: [...formData.images, ...validUrls],
    });
    setCreatePostLoading(false);
  };

  const handleFileUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  if (files.length + formData.files.length > MAX_FILES) {
    toast.error(`Bạn chỉ có thể tải lên tối đa ${MAX_FILES} tệp`);
    return;
  }

  const filteredFiles = files.filter((file) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Tệp ${file.name} vượt quá 20MB`);
      return false;
    }
    return true;
  });

  setCreatePostLoading(true);
  const uploadPromises = filteredFiles.map(async (file) => {
    try {
      const response = await uploadPostFile(file);
      return response.data;
    } catch (error) {
      toast.error(`Không thể tải lên tệp: ${file.name}`);
      return null;
    }
  });

  const uploadedFiles = await Promise.all(uploadPromises);
  const successfulUploads = uploadedFiles.filter(Boolean);

  setFormData({
    ...formData,
    files: [...formData.files, ...successfulUploads],
  });
  setCreatePostLoading(false);
};

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Tiêu đề và nội dung không được để trống");
      return;
    }

    setCreatePostLoading(true);
    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const postData = {
        ...formData,
        tags: tagsArray,
        category:
          activeTab === "exercises"
            ? "exercise"
            : activeTab === "learning"
            ? "question"
            : "share",
      };

      const response = await createPost(postData);
      toast.success("Tạo bài đăng thành công!");
      navigate(`/study-corner/${response.data._id}`);
      setShowCreateForm(false);
      setFormData({
        title: "",
        content: "",
        tags: "",
        category:
          activeTab === "exercises"
            ? "exercise"
            : activeTab === "learning"
            ? "question"
            : "share",
        subject: "highschool",
        status: "open",
        images: [],
        files: [],
      });
    } catch (error) {
      toast.error(error.message || "Không thể tạo bài đăng");
    } finally {
      setCreatePostLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thích bài đăng");
      return;
    }

    try {
      const response = await toggleLikePost(postId);

      if (currentPost && currentPost._id === postId) {
        setCurrentPost({
          ...currentPost,
          likes: response.data.likes,
        });
      } else {
        setPosts(
          posts.map((post) =>
            post._id === postId ? { ...post, likes: response.data.likes } : post
          )
        );
      }

      toast.success(
        response.data.isLiked ? "Đã thích bài đăng" : "Đã bỏ thích bài đăng"
      );
    } catch (error) {
      toast.error(error.message || "Không thể thích bài đăng");
    }
  };

  const handleBookmarkPost = async (postId) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh dấu bài đăng");
      return;
    }

    setBookmarkLoading((prev) => ({ ...prev, [postId]: true }));

    try {
      const isBookmarked = bookmarkedPostIds.includes(postId);

      if (isBookmarked) {
        await removeBookmark("post", postId);
        setBookmarkedPostIds(bookmarkedPostIds.filter((id) => id !== postId));
        socketRef.current.emit("bookmark", {
          userId: user._id,
          referenceType: "post",
          referenceId: postId,
          action: "remove",
        });
      } else {
        await addBookmark("post", postId);
        setBookmarkedPostIds([...bookmarkedPostIds, postId]);
        socketRef.current.emit("bookmark", {
          userId: user._id,
          referenceType: "post",
          referenceId: postId,
          action: "add",
        });
      }
    } catch (error) {
      toast.error(error.message || "Không thể đánh dấu bài đăng");
    } finally {
      setBookmarkLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeletePost = async (postId) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để xóa bài đăng");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) {
      try {
        await deletePost(postId);
        toast.success("Xóa bài đăng thành công!");

        if (currentPost && currentPost._id === postId) {
          navigate("/study-corner");
        } else {
          setPosts(posts.filter((post) => post._id !== postId));
        }
      } catch (error) {
        toast.error(error.message || "Không thể xóa bài đăng");
      }
    }
  };

  const handleUpdateStatus = async (postId, newStatus) => {
    try {
      const response = await updatePostStatus(postId, newStatus);

      if (currentPost && currentPost._id === postId) {
        setCurrentPost({
          ...currentPost,
          status: response.data.status,
        });
      } else {
        setPosts(
          posts.map((post) =>
            post._id === postId
              ? { ...post, status: response.data.status }
              : post
          )
        );
      }

      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentPost) return;

    try {
      const response = await createComment({
        postId: currentPost._id,
        content: commentText,
      });

      setComments([...comments, response.data]);
      setCommentText("");

      if (
        currentPost.category === "exercise" &&
        currentPost.status === "open"
      ) {
        handleUpdateStatus(currentPost._id, "pending");
      }
    } catch (error) {
      toast.error(error.message || "Không thể tạo bình luận");
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thích bình luận");
      return;
    }

    try {
      const response = await likeComment(commentId);
      setComments(
        comments.map((comment) =>
          comment._id === commentId
            ? { ...comment, likes: response.data.likes }
            : comment
        )
      );
    } catch (error) {
      toast.error(error.message || "Không thể thích bình luận");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      try {
        await deleteComment(commentId);
        setComments(comments.filter((comment) => comment._id !== commentId));
        toast.success("Xóa bình luận thành công!");
      } catch (error) {
        toast.error(error.message || "Không thể xóa bình luận");
      }
    }
  };

  const handleAiResponse = async () => {
    if (!currentPost) return;

    setIsProcessingAi(true);

    try {
      const question = `${currentPost.title}\n\n${currentPost.content}`;
      const aiResult = await askMathQuestion(question);
      const response = await updateAiResponse(currentPost._id, aiResult.answer);

      setAiResponse(aiResult.answer);
      setCurrentPost({
        ...currentPost,
        aiResponse: response.data.aiResponse,
        isAiAnswered: true,
      });

      toast.success("Đã nhận được câu trả lời từ AI!");
    } catch (error) {
      toast.error(error.message || "Không thể xử lý yêu cầu AI");
    } finally {
      setIsProcessingAi(false);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearch(value);
        setPage(1);
      }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleSearchByImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSearchImage(file);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await getPosts({
        category: "exercise",
        subject,
        search: "math problem",
        page: 1,
      });

      setPosts(response.data);
      setTotalPages(response.totalPages);
      setPage(1);

      toast.success("Đã tìm kiếm bằng hình ảnh!");
    } catch (error) {
      toast.error(error.message || "Không thể tìm kiếm bằng hình ảnh");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const PostRow = useCallback(
    ({ index, style }) => {
      const post = posts[index];
      const isBookmarked = bookmarkedPostIds.includes(post._id);

      return (
        <div style={style} className="post-card">
          <div className="post-header">
            <div className="post-author">
              <img
                src={
                  post.userId?.avatar ||
                  "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png"
                }
                alt={post.userId?.username || "Người dùng"}
                className="author-avatar"
              />
              <div>
                <h4>{post.userId?.username || "Người dùng"}</h4>
                <span className="post-date">{formatDate(post.createdAt)}</span>
              </div>
            </div>
            {post.status && (
              <div className={`post-status ${post.status}`}>
                {post.status === "open"
                  ? "Đang mở"
                  : post.status === "pending"
                  ? "Đang chờ"
                  : "Đã giải"}
              </div>
            )}
          </div>

          <h3 className="post-title">
            <Link to={`/study-corner/${post._id}`}>{post.title}</Link>
          </h3>

          <div className="post-content-preview">
            {post.content.length > 200
              ? `${post.content.substring(0, 200)}...`
              : post.content}
          </div>

          {post.images && post.images.length > 0 && (
            <div className="post-images-preview">
              <img
                src={post.images[0] || "/placeholder.svg"}
                alt="Hình ảnh bài đăng"
              />
              {post.images.length > 1 && (
                <div className="more-images">+{post.images.length - 1}</div>
              )}
            </div>
          )}

          <div className="post-tags">
            {post.tags &&
              post.tags.map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
          </div>

          <div className="post-footer">
            <div className="post-stats">
              <span>
                <i className="fas fa-eye"></i> {post.views || 0}
              </span>
              <span>
                <i className="fas fa-comment"></i> {post.commentCount || 0}
              </span>
              <span>
                <i className="fas fa-heart"></i>
                {post.likes ? post.likes.length : 0}
              </span>
            </div>

            <div className="post-actions">
              <button
                className={`action-button ${
                  post.likes && user && post.likes.includes(user._id)
                    ? "liked"
                    : ""
                }`}
                onClick={() => handleLikePost(post._id)}
                data-tooltip-id={`tooltip-like-${post._id}`}
                data-tooltip-content="Thích bài đăng"
              >
                <i className="fas fa-heart"></i>
              </button>
              <Tooltip id={`tooltip-like-${post._id}`} />

              <button
                className={`action-button ${isBookmarked ? "bookmarked" : ""}`}
                onClick={() => handleBookmarkPost(post._id)}
                disabled={bookmarkLoading[post._id]}
                data-tooltip-id={`tooltip-bookmark-${post._id}`}
                data-tooltip-content={isBookmarked ? "Bỏ lưu" : "Lưu bài đăng"}
              >
                {bookmarkLoading[post._id] ? (
                  <div
                    className="spinner"
                    style={{ width: "16px", height: "16px" }}
                  ></div>
                ) : (
                  <i className="fas fa-bookmark"></i>
                )}
              </button>
              <Tooltip id={`tooltip-bookmark-${post._id}`} />

              {user &&
                (post.userId?._id === user._id || user.role === "admin") && (
                  <button
                    className="action-button delete"
                    onClick={() => handleDeletePost(post._id)}
                    data-tooltip-id={`tooltip-delete-${post._id}`}
                    data-tooltip-content="Xóa bài đăng"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              <Tooltip id={`tooltip-delete-${post._id}`} />
            </div>
          </div>
        </div>
      );
    },
    [
      posts,
      bookmarkedPostIds,
      bookmarkLoading,
      user,
      handleLikePost,
      handleBookmarkPost,
      handleDeletePost,
    ]
  );

  if (loading && !currentPost) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div> Đang tải...
      </div>
    );
  }

  if (!user && !id) {
    return (
      <div className="login-prompt">
        <p>
          Vui lòng{" "}
          <Link to="/login" style={{ color: "#ff6f61" }}>
            đăng nhập
          </Link>{" "}
          để truy cập Góc học tập.
        </p>
      </div>
    );
  }

  return (
    <div className="study-corner">
      <div className="study-corner-container">
        {!id && (
          <div className="study-corner-sidebar">
            <h2>Góc học tập</h2>
            <nav>
              <ul>
                <li
                  className={activeTab === "exercises" ? "active" : ""}
                  onClick={() => {
                    setActiveTab("exercises");
                    navigate("/study-corner/exercises");
                  }}
                >
                  <a href="#">
                    <i className="fas fa-dumbbell"></i> Bài tập
                  </a>
                </li>
                <li
                  className={activeTab === "learning" ? "active" : ""}
                  onClick={() => {
                    setActiveTab("learning");
                    navigate("/study-corner/learning");
                  }}
                >
                  <a href="#">
                    <i className="fas fa-book"></i> Hỏi đáp
                  </a>
                </li>
                <li
                  className={activeTab === "sharing" ? "active" : ""}
                  onClick={() => {
                    setActiveTab("sharing");
                    navigate("/study-corner/sharing");
                  }}
                >
                  <a href="#">
                    <i className="fas fa-share-alt"></i> Chia sẻ
                  </a>
                </li>
                <li
                  className={activeTab === "bookmarks" ? "active" : ""}
                  onClick={() => {
                    setActiveTab("bookmarks");
                    navigate("/study-corner/bookmarks");
                  }}
                >
                  <a href="#">
                    <i className="fas fa-bookmark"></i> Đã lưu
                  </a>
                </li>
              </ul>
            </nav>
            <div className="sidebar-filters">
              <div className="filter-group">
                <label htmlFor="subject">Môn học</label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="highschool">Trung học</option>
                  <option value="secondary">Trung học cơ sở</option>
                  <option value="primary">Tiểu học</option>
                  <option value="university">Đại học</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="status">Trạng thái</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="open">Đang mở</option>
                  <option value="pending">Đang chờ</option>
                  <option value="solved">Đã giải</option>
                </select>
              </div>
              <div className="filter-group search-input">
                <label htmlFor="search">Tìm kiếm</label>
                <input
                  type="text"
                  id="search"
                  placeholder="Nhập từ khóa..."
                  value={searchInput}
                  onChange={handleSearchChange}
                />
                <button className="search-button">
                  <i className="fas fa-search"></i>
                </button>
              </div>
              <div className="filter-group">
                <label htmlFor="imageSearch">Tìm kiếm bằng ảnh</label>
                <input
                  type="file"
                  id="imageSearch"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleSearchByImage}
                  style={{ display: "none" }}
                />
                <button
                  className="image-search-button"
                  onClick={() => imageInputRef.current.click()}
                >
                  <i className="fas fa-camera"></i> Tải ảnh lên
                </button>
                {searchImage && (
                  <div className="image-preview">
                    <img
                      src={URL.createObjectURL(searchImage)}
                      alt="Preview"
                      className="search-image-preview"
                    />
                    <button
                      className="remove-image"
                      onClick={() => setSearchImage(null)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="study-corner-content">
          {!id ? (
            <>
              <div className="content-header">
                <h1>
                  {activeTab === "exercises"
                    ? "Bài tập"
                    : activeTab === "learning"
                    ? "Hỏi đáp"
                    : activeTab === "sharing"
                    ? "Chia sẻ"
                    : "Đã lưu"}
                </h1>
                {user && (
                  <button
                    className="create-post-button"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <i className="fas fa-plus"></i> Tạo bài đăng
                  </button>
                )}
              </div>

              {showCreateForm && (
                <div className="create-post-form">
                  <h2>Tạo bài đăng mới</h2>
                  <form onSubmit={handleCreatePost}>
                    <div className="form-group">
                      <label htmlFor="title">Tiêu đề</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Nhập tiêu đề..."
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="content">Nội dung</label>
                      <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="Nhập nội dung..."
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="tags">
                        Tags (cách nhau bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: toán, lý, hóa"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="imageUpload">Tải ảnh lên</label>
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        ref={imageInputRef}
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        className="upload-button"
                        onClick={() => imageInputRef.current.click()}
                        disabled={createPostLoading}
                      >
                        <i className="fas fa-camera"></i> Tải ảnh
                      </button>
                      {formData.images.map((url, index) => (
                        <div key={index} className="file-preview">
                          <i className="fas fa-image"></i>
                          <span>{`Hình ảnh ${index + 1}`}</span>
                          <button
                            className="remove-file"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                images: formData.images.filter(
                                  (_, i) => i !== index
                                ),
                              })
                            }
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="form-group">
                      <label htmlFor="fileUpload">Tải tệp lên</label>
                      <input
                        type="file"
                        id="fileUpload"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        className="upload-button"
                        onClick={() => fileInputRef.current.click()}
                        disabled={createPostLoading}
                      >
                        <i className="fas fa-file"></i> Tải tệp
                      </button>
                      {formData.files.map((file, index) => (
                        <div key={index} className="file-preview">
                          <i className="fas fa-file"></i>
                          <span>{file.name}</span>
                          <button
                            className="remove-file"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                files: formData.files.filter(
                                  (_, i) => i !== index
                                ),
                              })
                            }
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={createPostLoading}
                    >
                      {createPostLoading ? (
                        <div
                          className="spinner"
                          style={{ width: "16px", height: "16px" }}
                        ></div>
                      ) : (
                        "Đăng bài"
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowCreateForm(false)}
                      style={{ marginLeft: "10px" }}
                    >
                      Hủy
                    </button>
                  </form>
                </div>
              )}

              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div> Đang tải...
                </div>
              ) : posts.length === 0 ? (
                <div className="login-prompt">
                  <p>Không có bài đăng nào để hiển thị.</p>
                </div>
              ) : (
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height}
                      width={width}
                      itemCount={posts.length}
                      itemSize={300}
                      itemData={posts}
                      className="post-list"
                    >
                      {PostRow}
                    </List>
                  )}
                </AutoSizer>
              )}

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-button"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    <i className="fas fa-chevron-left"></i> Trước
                  </button>
                  <span className="pagination-info">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    className="pagination-button"
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                  >
                    Tiếp <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          ) : (
            currentPost && (
              <div className="post-detail">
                <div className="post-detail-header">
                  <div>
                    <div className="post-author">
                      <img
                        src={
                          currentPost.userId?.avatar ||
                          "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png"
                        }
                        alt={currentPost.userId?.username || "Người dùng"}
                        className="author-avatar"
                      />
                      <div>
                        <h4>{currentPost.userId?.username || "Người dùng"}</h4>
                        <span className="post-date">
                          {formatDateTime(currentPost.createdAt)}
                        </span>
                      </div>
                    </div>
                    {currentPost.status && (
                      <div className={`post-status ${currentPost.status}`}>
                        {currentPost.status === "open"
                          ? "Đang mở"
                          : currentPost.status === "pending"
                          ? "Đang chờ"
                          : "Đã giải"}
                      </div>
                    )}
                  </div>
                  {user &&
                    (currentPost.userId?._id === user._id ||
                      user.role === "admin") && (
                      <button
                        className="action-button delete"
                        onClick={() => handleDeletePost(currentPost._id)}
                        data-tooltip-id="tooltip-delete-detail"
                        data-tooltip-content="Xóa bài đăng"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  <Tooltip id="tooltip-delete-detail" />
                </div>

                <h1 className="post-detail-title">{currentPost.title}</h1>
                <div className="post-detail-content">{currentPost.content}</div>

                {currentPost.images && currentPost.images.length > 0 && (
                  <div className="post-detail-images">
                    {currentPost.images.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Hình ảnh ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {currentPost.files && currentPost.files.length > 0 && (
                  <div className="post-detail-files">
                    <h4>Tệp đính kèm</h4>
                    <ul>
                      {currentPost.files.map((file, index) => (
                        <li key={index}>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="fas fa-file"></i> {file.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="post-detail-tags">
                  {currentPost.tags &&
                    currentPost.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag}
                      </span>
                    ))}
                </div>

                <div className="post-detail-footer">
                  <div className="post-stats">
                    <span>
                      <i className="fas fa-eye"></i> {currentPost.views || 0}
                    </span>
                    <span>
                      <i className="fas fa-comment"></i>{" "}
                      {currentPost.commentCount || 0}
                    </span>
                    <span>
                      <i className="fas fa-heart"></i>
                      {currentPost.likes ? currentPost.likes.length : 0}
                    </span>
                  </div>

                  <div className="status-actions">
                    {user &&
                      (currentPost.userId?._id === user._id ||
                        user.role === "admin") && (
                        <>
                          <button
                            className={`status-button ${
                              currentPost.status === "open" ? "active" : ""
                            }`}
                            onClick={() =>
                              handleUpdateStatus(currentPost._id, "open")
                            }
                          >
                            Đang mở
                          </button>
                          <button
                            className={`status-button ${
                              currentPost.status === "pending" ? "active" : ""
                            }`}
                            onClick={() =>
                              handleUpdateStatus(currentPost._id, "pending")
                            }
                          >
                            Đang chờ
                          </button>
                          <button
                            className={`status-button ${
                              currentPost.status === "solved" ? "active" : ""
                            }`}
                            onClick={() =>
                              handleUpdateStatus(currentPost._id, "solved")
                            }
                          >
                            Đã giải
                          </button>
                        </>
                      )}
                  </div>
                </div>

                <div className="ai-response-section">
                  <div className="ai-response-header">
                    <h3>
                      <i className="fas fa-robot"></i> Trả lời từ AI
                    </h3>
                    {user &&
                      !currentPost.isAiAnswered &&
                      (currentPost.category === "exercise" ||
                        currentPost.category === "question") && (
                        <button
                          className="btn-primary"
                          onClick={handleAiResponse}
                          disabled={isProcessingAi}
                        >
                          {isProcessingAi ? (
                            <div
                              className="spinner"
                              style={{ width: "16px", height: "16px" }}
                            ></div>
                          ) : (
                            "Giải bài tập"
                          )}
                        </button>
                      )}
                  </div>
                  {isProcessingAi ? (
                    <div className="ai-processing">
                      <div className="spinner"></div> Đang xử lý...
                    </div>
                  ) : currentPost.aiResponse ? (
                    <div className="ai-response-content">
                      {currentPost.aiResponse}
                    </div>
                  ) : (
                    <div className="ai-response-placeholder">
                      Chưa có câu trả lời từ AI. Nhấn "Giải bài tập" để yêu cầu.
                    </div>
                  )}
                </div>

                <div className="comments-section">
                  <h3>Bình luận</h3>
                  {user && (
                    <form
                      className="comment-form"
                      onSubmit={handleCreateComment}
                    >
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Viết bình luận..."
                      />
                      <button type="submit" disabled={!commentText.trim()}>
                        Gửi
                      </button>
                    </form>
                  )}
                  {commentsLoading ? (
                    <div className="loading-spinner">
                      <div className="spinner"></div> Đang tải...
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="no-comments">Chưa có bình luận nào.</div>
                  ) : (
                    <div className="comments-list">
                      {comments.map((comment) => (
                        <div key={comment._id} className="comment">
                          <div className="comment-header">
                            <div className="comment-author">
                              <img
                                src={
                                  comment.userId?.avatar ||
                                  "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png"
                                }
                                alt={comment.userId?.username || "Người dùng"}
                                className="author-avatar"
                              />
                              <div>
                                <h4>
                                  {comment.userId?.username || "Người dùng"}
                                </h4>
                                <span className="comment-date">
                                  {formatDateTime(comment.createdAt)}
                                </span>
                              </div>
                            </div>
                            {user &&
                              (comment.userId?._id === user._id ||
                                user.role === "admin") && (
                                <button
                                  className="delete-comment"
                                  onClick={() =>
                                    handleDeleteComment(comment._id)
                                  }
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                          </div>
                          <div className="comment-content">
                            {comment.content}
                          </div>
                          <div className="comment-footer">
                            <button
                              className={`like-comment ${
                                comment.likes && user
                                  ? comment.likes.includes(user._id)
                                    ? "liked"
                                    : ""
                                  : ""
                              }`}
                              onClick={() => handleLikeComment(comment._id)}
                            >
                              <i className="fas fa-heart"></i>{" "}
                              {comment.likes ? comment.likes.length : 0}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyCorner;
