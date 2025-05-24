"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getDocumentById,
  downloadDocument,
  convertDocumentFormat,
} from "../../services/documentService";
import{
  addBookmark,
  removeBookmark,
  checkBookmarks,
} from "../../services/bookmarkService";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../../services/commentService";
import RelatedDocuments from "./RelatedDocuments";
import io from "socket.io-client";
import { Helmet } from "react-helmet";
import "./Document.css";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

const DocumentDetail = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [document, setDocument] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [currentPageComments, setCurrentPageComments] = useState(1);
  const [notes, setNotes] = useState("");
  const commentsPerPage = 5;
  const mathJaxRef = useRef(null);
  const [mathJaxLoaded, setMathJaxLoaded] = useState(false);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const docResponse = await getDocumentById(id);
        setDocument(docResponse);
        if (user) {
          const bookmarkResponse = await checkBookmarks(id);
          setIsBookmarked(bookmarkResponse.isBookmarked || false);
        }
        const commentsResponse = await getComments(id, {
          type: "document",
        });
        setComments(
          Array.isArray(commentsResponse.comments)
            ? commentsResponse.comments
            : []
        );
        const savedNotes = localStorage.getItem(`notes_${id}`);
        if (savedNotes) setNotes(savedNotes);
      } catch (err) {
        setError(
          `Không thể tải tài liệu: ${err.message || "Lỗi không xác định"}`
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadDocument();
  }, [id, user]);

  useEffect(() => {
    if (document?.content && /\\$$.*?\\$$|\\\[.*?\\\]/.test(document.content)) {
      const loadMathJax = () => {
        if (!window.MathJax) {
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
          script.async = true;
          document.head.appendChild(script);

          script.onload = () => {
            setMathJaxLoaded(true);
            window.MathJax.startup.promise.then(() => {
              if (mathJaxRef.current) {
                window.MathJax.typeset([mathJaxRef.current]);
              }
            });
          };
          script.onerror = () => {
            toast.error("Không thể tải MathJax!");
          };
        } else {
          setMathJaxLoaded(true);
          if (mathJaxRef.current) {
            window.MathJax.typeset([mathJaxRef.current]);
          }
        }
      };
      loadMathJax();
    }
  }, [document]);

  const handleDownload = async (format = "pdf") => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để t��i tài liệu!");
      return;
    }
    try {
      let response;
      if (format === "pdf") {
        response = await downloadDocument(id);
        if (response?.fileUrl) {
          window.open(response.fileUrl, "_blank");
        } else {
          throw new Error("Không tìm thấy URL file!");
        }
      } else {
        response = await convertDocumentFormat(id, format);
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `${document?.title || "document"}.${format}`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      toast.success(`Đang tải tài liệu dạng ${format.toUpperCase()}...`);
    } catch (err) {
      toast.error(
        `Không thể tải tài liệu: ${err.message || "Lỗi không xác định"}`
      );
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh dấu tài liệu!");
      return;
    }
    try {
      if (isBookmarked) {
        await removeBookmark(id);
        setIsBookmarked(false);
        toast.success("Đã xóa đánh dấu!");
        socket.emit("bookmarkUpdate", {
          documentId: id,
          userId: user._id,
          action: "remove",
        });
      } else {
        await addBookmark({ referenceId: id, referenceType: "document" });
        setIsBookmarked(true);
        toast.success("Đã đánh dấu tài liệu!");
        socket.emit("bookmarkUpdate", {
          documentId: id,
          userId: user._id,
          action: "add",
        });
      }
    } catch (err) {
      toast.error(
        `Không thể cập nhật đánh dấu: ${err.message || "Lỗi không xác định"}`
      );
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vui lòng đăng nhập để bình luận!");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Nội dung bình luận không được để trống!");
      return;
    }
    try {
      const comment = await createComment({
        referenceId: id,
        referenceType: "document",
        content: newComment,
      });
      setComments([comment, ...comments]);
      setNewComment("");
      toast.success("Đã gửi bình luận!");
    } catch (err) {
      toast.error(
        `Không thể gửi bình luận: ${err.message || "Lỗi không xác định"}`
      );
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content || "");
  };

  const handleUpdateComment = async (e, commentId) => {
    e.preventDefault();
    if (!editContent.trim()) {
      toast.error("Nội dung bình luận không được để trống!");
      return;
    }
    try {
      const updatedComment = await updateComment(commentId, {
        content: editContent,
      });
      setComments(
        comments.map((c) => (c._id === commentId ? updatedComment : c))
      );
      setEditingComment(null);
      setEditContent("");
      toast.success("Đã cập nhật bình luận!");
    } catch (err) {
      toast.error(
        `Không thể cập nhật bình luận: ${err.message || "Lỗi không xác định"}`
      );
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
      toast.success("Đã xóa bình luận!");
    } catch (err) {
      toast.error(
        `Không thể xóa bình luận: ${err.message || "Lỗi không xác định"}`
      );
    }
  };

  const handleCopyContent = () => {
    if (document?.content) {
      navigator.clipboard.writeText(document.content);
      toast.success("Đã sao chép nội dung!");
    } else {
      toast.error("Không có nội dung để sao chép!");
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/documents/detail/${id}`;
    if (navigator.share) {
      navigator
        .share({
          title: document?.title || "Tài liệu FunMath",
          url: shareUrl,
        })
        .catch(() => {
          navigator.clipboard.writeText(shareUrl);
          toast.success("Đã sao chép liên kết chia sẻ!");
        });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Đã sao chép liên kết chia sẻ!");
    }
  };

  const handleSolveProblem = async () => {
    if (
      !document?.content ||
      !/\\$$.*?\\$$|\\\[.*?\\\]/.test(document.content)
    ) {
      toast.error("Không tìm thấy bài toán để giải!");
      return;
    }
    try {
      toast.info(
        "Tính năng giải toán đang trong giai đoạn phát triển. Vui lòng thử lại sau!"
      );
    } catch (err) {
      toast.error(
        `Không thể giải bài toán: ${err.message || "Lỗi không xác định"}`
      );
    }
  };

  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    localStorage.setItem(`notes_${id}`, newNotes);
  };

  const indexOfLastComment = currentPageComments * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );
  const totalPagesComments = Math.ceil(comments.length / commentsPerPage);

  if (isLoading) return <p className="loading-text">Đang tải tài liệu...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!document)
    return <p className="error-message">Không tìm thấy tài liệu!</p>;

  return (
    <div className="container">
      <Helmet>
        <title>{document.title || "Tài liệu"} - FunMath</title>
        <meta
          name="description"
          content={
            document.description ||
            `Tài liệu ${document.title || "không có tiêu đề"} - FunMath.`
          }
        />
      </Helmet>
      <div className="doc-detail">
        <h2 className="doc-title">{document.title || "Không có tiêu đề"}</h2>
        <div className="doc-meta">
          <div>
            <p>Đăng bởi: {document.uploadedBy?.username || "Ẩn danh"}</p>
            <p>
              Ngày đăng:{" "}
              {document.uploadedAt
                ? new Date(document.uploadedAt).toLocaleDateString()
                : "Không xác định"}
            </p>
            <p>
              Lượt xem: {document.views || 0} | Lượt tải:{" "}
              {document.downloads || 0}
            </p>
          </div>
          <div className="doc-actions">
            <button onClick={togglePreview} className="preview-button">
              {showPreview ? "Ẩn xem trước" : "Xem trước"}
            </button>
            <button
              onClick={() => handleDownload("pdf")}
              className="download-button"
            >
              Tải PDF
            </button>
            <button
              onClick={() => handleDownload("html")}
              className="download-button"
            >
              Tải HTML
            </button>
            <button
              onClick={() => handleDownload("markdown")}
              className="download-button"
            >
              Tải Markdown
            </button>
            <button onClick={handleShare} className="download-button">
              Chia sẻ
            </button>
            <button onClick={handleBookmark} className="bookmark-button">
              <span style={{ marginRight: "5px" }}>
                {isBookmarked ? "★" : "☆"}
              </span>
              {isBookmarked ? "Xóa đánh dấu" : "Đánh dấu"}
            </button>
          </div>
        </div>
        {showPreview && document.fileUrl && (
          <div className="pdf-preview">
            <iframe
              src={document.fileUrl}
              title="PDF Preview"
              className="pdf-iframe"
              loading="lazy"
              frameBorder="0"
            ></iframe>
          </div>
        )}
        <div className="doc-content">
          <div
            ref={mathJaxRef}
            dangerouslySetInnerHTML={{
              __html: document.content || "Không có nội dung",
            }}
          />
          <button
            onClick={handleCopyContent}
            className="comment-submit"
            style={{ marginTop: "10px" }}
          >
            Sao chép nội dung
          </button>
          <button
            onClick={handleSolveProblem}
            className="comment-submit"
            style={{ marginTop: "10px" }}
          >
            Giải bài tập
          </button>
        </div>
        {document.thumbnail && (
          <img
            src={document.thumbnail}
            alt={document.title || "Hình ảnh tài liệu"}
            className="doc-thumbnail"
          />
        )}
        <div className="doc-tags">
          <p className="tags-label">Thẻ:</p>
          <p>{document.tags?.join(", ") || "Không có thẻ"}</p>
        </div>
        <div className="doc-notes">
          <h3>Ghi chú cá nhân</h3>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            className="comment-input"
            placeholder="Viết ghi chú của bạn..."
          />
        </div>
        <Link to="/documents" className="back-link">
          Quay lại danh sách
        </Link>
        <div className="comments-section">
          <h3 className="comments-title">Bình luận</h3>
          {user ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="comment-input"
                placeholder="Viết bình luận của bạn..."
              />
              <button type="submit" className="comment-submit">
                Gửi
              </button>
            </form>
          ) : (
            <p className="comment-login-prompt">
              Vui lòng{" "}
              <Link to="/auth/login" className="login-link">
                đăng nhập
              </Link>{" "}
              để bình luận.
            </p>
          )}
          <div className="comments-list">
            {currentComments.length > 0 ? (
              currentComments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <p className="comment-author">
                    {comment.author?.username || "Ẩn danh"}
                  </p>
                  {editingComment === comment._id ? (
                    <form
                      onSubmit={(e) => handleUpdateComment(e, comment._id)}
                      className="comment-edit-form"
                    >
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="comment-input"
                      />
                      <div className="comment-edit-actions">
                        <button type="submit" className="comment-submit">
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingComment(null)}
                          className="comment-cancel"
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="comment-content">
                        {comment.content || "Không có nội dung"}
                      </p>
                      <p className="comment-date">
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleString()
                          : "Không xác định"}
                      </p>
                      {(user?._id === comment.author?._id ||
                        user?.role === "admin") && (
                        <div className="comment-actions">
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="comment-edit-button"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="comment-delete-button"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="no-comments">Chưa có bình luận nào.</p>
            )}
          </div>
          {totalPagesComments > 1 && (
            <div className="pagination">
              <button
                onClick={() =>
                  setCurrentPageComments((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPageComments === 1}
                className="pagination-button"
              >
                Trước
              </button>
              {[...Array(totalPagesComments)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPageComments(i + 1)}
                  className={`pagination-button ${
                    currentPageComments === i + 1 ? "active" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPageComments((prev) =>
                    Math.min(prev + 1, totalPagesComments)
                  )
                }
                disabled={currentPageComments === totalPagesComments}
                className="pagination-button"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
      <RelatedDocuments currentDoc={document} />
    </div>
  );
};

export default DocumentDetail;
