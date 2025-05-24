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
  const [searchInput, setSearchInput] = useState(""); // Thêm state để quản lý giá trị input
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

  // Khởi tạo WebSocket
  useEffect(() => {
    if (user) {
      socketRef.current = io("http://localhost:5000", {
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to WebSocket");
        socketRef.current.emit("join", user._id);
      });

      socketRef.current.on("bookmark_notification", ({ message }) => {
        toast.info(message);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  // Kiểm tra trạng thái bookmark
  const loadBookmarkedPostIds = useCallback(
    async (posts) => {
      if (!user || !posts || posts.length === 0) return;

      try {
        const postIds = posts.map((post) => post._id);
        const response = await checkBookmarks("post", postIds);
        setBookmarkedPostIds(response.data || []);
      } catch (error) {
        console.error("Error checking bookmarks:", error);
      }
    },
    [user]
  );

  // Tải danh sách bài đăng
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

        setPosts(response.data);
        setTotalPages(response.totalPages);

        if (activeTab !== "bookmarks") {
          await loadBookmarkedPostIds(response.data);
        }
      } catch (error) {
        toast.error(error.message || "Không thể tải danh sách bài đăng");
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

  // Tải chi tiết bài đăng
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

    const uploadPromises = files.map(async (file) => {
      try {
        const response = await uploadPostImage(file);
        return response.url;
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
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const uploadPromises = files.map(async (file) => {
      try {
        const response = await uploadPostFile(file);
        return response;
      } catch (error) {
        toast.error(`Không thể tải lên file: ${file.name}`);
        return null;
      }
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    const validFiles = uploadedFiles.filter(Boolean);

    setFormData({
      ...formData,
      files: [...formData.files, ...validFiles],
    });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setCreatePostLoading(true);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const postData = {
        ...formData,
        tags: tagsArray,
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
          likes: response.likes,
        });
      } else {
        setPosts(
          posts.map((post) =>
            post._id === postId ? { ...post, likes: response.likes } : post
          )
        );
      }

      toast.success(
        response.isLiked ? "Đã thích bài đăng" : "Đã bỏ thích bài đăng"
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
          status: response.status,
        });
      } else {
        setPosts(
          posts.map((post) =>
            post._id === postId ? { ...post, status: response.status } : post
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
        aiResponse: response.aiResponse,
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
    setSearchInput(value); // Cập nhật giá trị input ngay lập tức
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
                <i className="fas fa-heart"></i>{" "}
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
                  <>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeletePost(post._id)}
                      data-tooltip-id={`tooltip-delete-${post._id}`}
                      data-tooltip-content="Xóa bài đăng"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <Tooltip id={`tooltip-delete-${post._id}`} />
                  </>
                )}
            </div>
          </div>
        </div>
      );
    },
    [
      posts,
      user,
      bookmarkedPostIds,
      bookmarkLoading,
      handleLikePost,
      handleBookmarkPost,
      handleDeletePost,
    ]
  );

  const renderPostList = useCallback(() => {
    if (loading && posts.length === 0) {
      return <div className="loading-spinner">Đang tải...</div>;
    }

    if (posts.length === 0) {
      return (
        <div className="empty-state">
          <p>Không có bài đăng nào.</p>
          {user && (
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Tạo bài đăng mới
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="post-list" style={{ height: "600px" }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemCount={posts.length}
              itemSize={300}
            >
              {PostRow}
            </List>
          )}
        </AutoSizer>
      </div>
    );
  }, [loading, posts, user, PostRow]);

  const renderPostDetail = useCallback(() => {
    if (!currentPost) return null;

    const isAuthor = user && currentPost.userId?._id === user._id;
    const isLiked =
      user && currentPost.likes && currentPost.likes.includes(user._id);
    const isBookmarked = bookmarkedPostIds.includes(currentPost._id);

    return (
      <div className="post-detail">
        <div className="post-detail-header">
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
                {formatDate(currentPost.createdAt)}
              </span>
            </div>
          </div>

          <div className="post-actions">
            {currentPost.category === "exercise" && (
              <div className={`post-status ${currentPost.status}`}>
                {currentPost.status === "open"
                  ? "Đang mở"
                  : currentPost.status === "pending"
                  ? "Đang chờ"
                  : "Đã giải"}
              </div>
            )}

            {isAuthor && currentPost.category === "exercise" && (
              <div className="status-actions">
                <button
                  className={`status-button ${
                    currentPost.status === "open" ? "active" : ""
                  }`}
                  onClick={() => handleUpdateStatus(currentPost._id, "open")}
                >
                  Đang mở
                </button>
                <button
                  className={`status-button ${
                    currentPost.status === "pending" ? "active" : ""
                  }`}
                  onClick={() => handleUpdateStatus(currentPost._id, "pending")}
                >
                  Đang chờ
                </button>
                <button
                  className={`status-button ${
                    currentPost.status === "solved" ? "active" : ""
                  }`}
                  onClick={() => handleUpdateStatus(currentPost._id, "solved")}
                >
                  Đã giải
                </button>
              </div>
            )}
          </div>
        </div>

        <h2 className="post-detail-title">{currentPost.title}</h2>

        <div className="post-detail-content">{currentPost.content}</div>

        {currentPost.images && currentPost.images.length > 0 && (
          <div className="post-detail-images">
            {currentPost.images.map((image, index) => (
              <img
                key={index}
                src={image || "/placeholder.svg"}
                alt={`Hình ảnh ${index + 1}`}
              />
            ))}
          </div>
        )}

        {currentPost.files && currentPost.files.length > 0 && (
          <div className="post-detail-files">
            <h4>Tệp đính kèm:</h4>
            <ul>
              {currentPost.files.map((file, index) => (
                <li key={index}>
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
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
              <i className="fas fa-eye"></i> {currentPost.views || 0} lượt xem
            </span>
            <span>
              <i className="fas fa-comment"></i> {comments.length} bình luận
            </span>
            <span>
              <i className="fas fa-heart"></i>{" "}
              {currentPost.likes ? currentPost.likes.length : 0} lượt thích
            </span>
          </div>

          <div className="post-actions">
            <button
              className={`action-button ${isLiked ? "liked" : ""}`}
              onClick={() => handleLikePost(currentPost._id)}
              data-tooltip-id="tooltip-like-detail"
              data-tooltip-content="Thích bài đăng"
            >
              <i className="fas fa-heart"></i> Thích
            </button>
            <Tooltip id="tooltip-like-detail" />

            <button
              className={`action-button ${isBookmarked ? "bookmarked" : ""}`}
              onClick={() => handleBookmarkPost(currentPost._id)}
              disabled={bookmarkLoading[currentPost._id]}
              data-tooltip-id="tooltip-bookmark-detail"
              data-tooltip-content={isBookmarked ? "Bỏ lưu" : "Lưu bài đăng"}
            >
              {bookmarkLoading[currentPost._id] ? (
                <div
                  className="spinner"
                  style={{ width: "16px", height: "16px" }}
                ></div>
              ) : (
                <>
                  <i className="fas fa-bookmark"></i> Lưu
                </>
              )}
            </button>
            <Tooltip id="tooltip-bookmark-detail" />

            {(isAuthor || (user && user.role === "admin")) && (
              <>
                <button
                  className="action-button delete"
                  onClick={() => handleDeletePost(currentPost._id)}
                  data-tooltip-id="tooltip-delete-detail"
                  data-tooltip-content="Xóa bài đăng"
                >
                  <i className="fas fa-trash"></i> Xóa
                </button>
                <Tooltip id="tooltip-delete-detail" />
              </>
            )}
          </div>
        </div>

        {currentPost.category === "exercise" && (
          <div className="ai-response-section">
            <div className="ai-response-header">
              <h3>
                <i className="fas fa-robot"></i> Trợ giúp từ AI
              </h3>
              {!currentPost.isAiAnswered && !isProcessingAi && (
                <button
                  className="btn-primary"
                  onClick={handleAiResponse}
                  disabled={isProcessingAi}
                >
                  <i className="fas fa-magic"></i> Giải bài tập bằng AI
                </button>
              )}
            </div>

            {isProcessingAi ? (
              <div className="ai-processing">
                <div className="spinner"></div>
                <p>Đang xử lý bài toán của bạn...</p>
              </div>
            ) : currentPost.isAiAnswered ? (
              <div className="ai-response-content">
                {currentPost.aiResponse.split("\n").map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            ) : (
              <div className="ai-response-placeholder">
                <p>
                  AI có thể giúp bạn giải bài tập này. Nhấn nút "Giải bài tập
                  bằng AI" để nhận trợ giúp.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="comments-section">
          <h3>Bình luận ({comments.length})</h3>

          {user ? (
            <form className="comment-form" onSubmit={handleCreateComment}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                required
              />
              <button type="submit" disabled={!commentText.trim()}>
                Gửi bình luận
              </button>
            </form>
          ) : (
            <div className="login-prompt">
              <p>
                Vui lòng <Link to="/auth/login">đăng nhập</Link> để bình luận.
              </p>
            </div>
          )}

          {commentsLoading ? (
            <div className="loading-spinner">Đang tải bình luận...</div>
          ) : comments.length > 0 ? (
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
                        <h4>{comment.userId?.username || "Người dùng"}</h4>
                        <span className="comment-date">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                    </div>

                    {user &&
                      (comment.userId?._id === user._id ||
                        user.role === "admin") && (
                        <>
                          <button
                            className="delete-comment"
                            onClick={() => handleDeleteComment(comment._id)}
                            data-tooltip-id={`tooltip-delete-comment-${comment._id}`}
                            data-tooltip-content="Xóa bình luận"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                          <Tooltip
                            id={`tooltip-delete-comment-${comment._id}`}
                          />
                        </>
                      )}
                  </div>

                  <div className="comment-content">{comment.content}</div>

                  <div className="comment-footer">
                    <button
                      className={`like-comment ${
                        user &&
                        comment.likes &&
                        comment.likes.includes(user._id)
                          ? "liked"
                          : ""
                      }`}
                      onClick={() => handleLikeComment(comment._id)}
                      data-tooltip-id={`tooltip-like-comment-${comment._id}`}
                      data-tooltip-content="Thích bình luận"
                    >
                      <i className="fas fa-heart"></i>{" "}
                      {comment.likes ? comment.likes.length : 0}
                    </button>
                    <Tooltip id={`tooltip-like-comment-${comment._id}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-comments">
              <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
            </div>
          )}
        </div>
      </div>
    );
  }, [
    currentPost,
    user,
    comments,
    commentsLoading,
    bookmarkedPostIds,
    bookmarkLoading,
  ]);

  const renderCreateForm = () => {
    return (
      <div className="create-post-form">
        <h2>
          {activeTab === "exercises"
            ? "Đăng bài tập cần giải"
            : activeTab === "learning"
            ? "Đặt câu hỏi học tập"
            : "Chia sẻ kiến thức"}
        </h2>

        <form onSubmit={handleCreatePost}>
          <div className="form-group">
            <label htmlFor="title">Tiêu đề *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={200}
              placeholder="Nhập tiêu đề bài đăng..."
              disabled={createPostLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Nội dung *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={5}
              placeholder="Mô tả chi tiết bài toán hoặc câu hỏi của bạn..."
              disabled={createPostLoading}
            />
          </div>

          {activeTab !== "sharing" && (
            <div className="form-group">
              <label htmlFor="subject">Cấp học *</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                disabled={createPostLoading}
              >
                <option value="primary">Tiểu học</option>
                <option value="secondary">THCS</option>
                <option value="highschool">THPT</option>
                <option value="university">Đại học</option>
                <option value="other">Khác</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="tags">Thẻ</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Nhập các thẻ, phân cách bằng dấu phẩy (ví dụ: đại số, hình học, giải tích)"
              disabled={createPostLoading}
            />
          </div>

          <div className="form-group">
            <label>Hình ảnh</label>
            <div className="upload-preview">
              {formData.images.map((url, index) => (
                <div key={index} className="image-preview">
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Preview ${index}`}
                  />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        images: formData.images.filter((_, i) => i !== index),
                      })
                    }
                    disabled={createPostLoading}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="upload-button"
                onClick={() => imageInputRef.current.click()}
                disabled={createPostLoading}
              >
                <i className="fas fa-image"></i> Thêm hình ảnh
              </button>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                style={{ display: "none" }}
                disabled={createPostLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tệp đính kèm</label>
            <div className="upload-preview">
              {formData.files.map((file, index) => (
                <div key={index} className="file-preview">
                  <i className="fas fa-file"></i> {file.name}
                  <button
                    type="button"
                    className="remove-file"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        files: formData.files.filter((_, i) => i !== index),
                      })
                    }
                    disabled={createPostLoading}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="upload-button"
                onClick={() => fileInputRef.current.click()}
                disabled={createPostLoading}
              >
                <i className="fas fa-paperclip"></i> Thêm tệp đính kèm
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                style={{ display: "none" }}
                disabled={createPostLoading}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowCreateForm(false)}
              disabled={createPostLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={createPostLoading}
            >
              {createPostLoading ? (
                <>
                  <div
                    className="spinner"
                    style={{
                      display: "inline-block",
                      width: "20px",
                      height: "20px",
                      marginRight: "8px",
                    }}
                  ></div>
                  Đang đăng...
                </>
              ) : (
                "Đăng bài"
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="study-corner-container">
      <div className="study-corner-sidebar">
        <h2>Góc học tập</h2>
        <nav>
          <ul>
            <li className={activeTab === "exercises" ? "active" : ""}>
              <Link to="/study-corner?tab=exercises">
                <i className="fas fa-book"></i> Bài tập
              </Link>
            </li>
            <li className={activeTab === "learning" ? "active" : ""}>
              <Link to="/study-corner?tab=learning">
                <i className="fas fa-question-circle"></i> Hỏi đáp
              </Link>
            </li>
            <li className={activeTab === "sharing" ? "active" : ""}>
              <Link to="/study-corner?tab=sharing">
                <i className="fas fa-share-alt"></i> Chia sẻ
              </Link>
            </li>
            <li className={activeTab === "bookmarks" ? "active" : ""}>
              <Link to="/study-corner?tab=bookmarks">
                <i className="fas fa-bookmark"></i> Đã lưu
              </Link>
            </li>
          </ul>
        </nav>

        {!id && (
          <div className="sidebar-filters">
            <h3>Bộ lọc</h3>

            {(activeTab === "exercises" || activeTab === "learning") && (
              <>
                <div className="filter-group">
                  <label htmlFor="subject-filter">Cấp học</label>
                  <select
                    id="subject-filter"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="">Tất cả</option>
                    <option value="primary">Tiểu học</option>
                    <option value="secondary">THCS</option>
                    <option value="highschool">THPT</option>
                    <option value="university">Đại học</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                {activeTab === "exercises" && (
                  <div className="filter-group">
                    <label htmlFor="status-filter">Trạng thái</label>
                    <select
                      id="status-filter"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="">Tất cả</option>
                      <option value="open">Đang mở</option>
                      <option value="pending">Đang chờ</option>
                      <option value="solved">Đã giải</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="filter-group">
              <label htmlFor="search-filter">Tìm kiếm</label>
              <div className="search-input">
                <input
                  type="text"
                  id="search-filter"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Tìm kiếm..."
                />
                <button
                  className="search-button"
                  onClick={() => {
                    setSearch(searchInput);
                    setPage(1);
                  }}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label>Tìm kiếm bằng hình ảnh</label>
              <button
                className="image-search-button"
                onClick={() => imageInputRef.current.click()}
              >
                <i className="fas fa-camera"></i> Tải lên hình ảnh
              </button>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleSearchByImage}
                accept="image/*"
                style={{ display: "none" }}
              />

              {searchImage && (
                <div className="image-preview">
                  <img
                    src={URL.createObjectURL(searchImage) || "/placeholder.svg"}
                    alt="Search"
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
        )}
      </div>

      <div className="study-corner-content">
        <div className="content-header">
          <h1>
            {id
              ? currentPost?.title || "Chi tiết bài đăng"
              : activeTab === "exercises"
              ? "Bài tập toán học"
              : activeTab === "learning"
              ? "Hỏi đáp học tập"
              : activeTab === "sharing"
              ? "Chia sẻ kiến thức"
              : "Bài đăng đã lưu"}
          </h1>

          {!id && !showCreateForm && user && (
            <button
              className="create-post-button"
              onClick={() => setShowCreateForm(true)}
            >
              <i className="fas fa-plus"></i>{" "}
              {activeTab === "exercises"
                ? "Đăng bài tập"
                : activeTab === "learning"
                ? "Đặt câu hỏi"
                : "Chia sẻ"}
            </button>
          )}

          {!id && !showCreateForm && !user && (
            <div className="login-prompt">
              <p>
                Vui lòng <Link to="/auth/login">đăng nhập</Link> để tạo bài
                đăng.
              </p>
            </div>
          )}
        </div>

        {showCreateForm
          ? renderCreateForm()
          : id
          ? renderPostDetail()
          : renderPostList()}

        {!id && !showCreateForm && totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-button"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              <i className="fas fa-chevron-left"></i> Trang trước
            </button>

            <span className="pagination-info">
              Trang {page} / {totalPages}
            </span>

            <button
              className="pagination-button"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Trang sau <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyCorner;
