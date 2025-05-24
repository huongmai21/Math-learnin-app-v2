import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  replyToComment,
} from "../../../services/commentService";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import "./Comment.css";

const CommentSection = ({ referenceId, referenceType }) => {
  const { user } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [replyingId, setReplyingId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 5;

  const loadComments = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      const data = await getComments(referenceId, referenceType, {
        page: pageToLoad,
        limit: itemsPerPage,
      });
      setComments(data.data || []);
      setTotal(data.total || 0);
      setPage(pageToLoad);
    } catch (err) {
      toast.error("Lỗi khi tải bình luận: " + (err.message || "Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [referenceId, referenceType]);

  const handlePost = async () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để bình luận.");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Bình luận không được để trống!");
      return;
    }
    try {
      setLoading(true);
      await createComment(referenceId, referenceType, newComment);
      setNewComment("");
      toast.success("Đăng bình luận thành công!");
      loadComments(1);
    } catch (err) {
      toast.error("Lỗi khi đăng bình luận: " + (err.message || "Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId) => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để trả lời.");
      return;
    }
    if (!replyContent.trim()) {
      toast.error("Nội dung trả lời không được để trống!");
      return;
    }
    try {
      setLoading(true);
      await replyToComment(parentId, replyContent);
      setReplyContent("");
      setReplyingId(null);
      toast.success("Trả lời bình luận thành công!");
      loadComments(page);
    } catch (err) {
      toast.error("Lỗi khi trả lời: " + (err.message || "Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      setLoading(true);
      await deleteComment(id);
      toast.success("Xóa bình luận thành công!");
      loadComments(page);
    } catch (err) {
      toast.error("Không thể xóa bình luận: " + (err.message || "Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editingContent.trim()) {
      toast.error("Bình luận không được để trống!");
      return;
    }
    try {
      setLoading(true);
      await updateComment(id, editingContent);
      setEditingId(null);
      setEditingContent("");
      toast.success("Sửa bình luận thành công!");
      loadComments(page);
    } catch (err) {
      toast.error("Không thể sửa bình luận: " + (err.message || "Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  const isAuthorOrAdmin = (comment) =>
    user && (comment.author._id === user._id || user.role === "admin");

  const renderComments = useMemo(() => {
    const renderComment = (comment, depth = 0) => (
      <li key={comment._id} className={`comment-item depth-${depth}`}>
        <div className="comment-header">
          <strong>{comment.author?.username || "Ẩn danh"}</strong>
          <span>{new Date(comment.createdAt).toLocaleString("vi-VN")}</span>
        </div>
        {editingId === comment._id ? (
          <div className="comment-edit">
            <textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              disabled={loading}
            />
            <button onClick={() => handleEdit(comment._id)} disabled={loading}>
              Lưu
            </button>
            <button onClick={() => setEditingId(null)} disabled={loading}>
              Hủy
            </button>
          </div>
        ) : (
          <>
            <p>{comment.content}</p>
            <div className="comment-actions">
              <button
                onClick={() => setReplyingId(replyingId === comment._id ? null : comment._id)}
                disabled={loading}
              >
                Trả lời
              </button>
              {isAuthorOrAdmin(comment) && (
                <>
                  <button
                    onClick={() => {
                      setEditingId(comment._id);
                      setEditingContent(comment.content);
                    }}
                    disabled={loading}
                  >
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(comment._id)} disabled={loading}>
                    🗑️
                  </button>
                </>
              )}
            </div>
            {replyingId === comment._id && (
              <div className="comment-reply-input">
                <textarea
                  placeholder="Viết câu trả lời..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  disabled={loading}
                />
                <button onClick={() => handleReply(comment._id)} disabled={loading}>
                  Gửi
                </button>
                <button onClick={() => setReplyingId(null)} disabled={loading}>
                  Hủy
                </button>
              </div>
            )}
            {comment.replies && comment.replies.length > 0 && (
              <ul className="comment-replies">
                {comment.replies.map((reply) => renderComment(reply, depth + 1))}
              </ul>
            )}
          </>
        )}
      </li>
    );

    return comments.map((comment) => renderComment(comment));
  }, [comments, editingId, editingContent, replyingId, replyContent, loading, user]);

  return (
    <div className="comment-section">
      <h3>Bình luận ({total})</h3>

      {loading && <div className="loading-spinner"></div>}

      {user ? (
        <div className="comment-input">
          <textarea
            placeholder="Viết bình luận của bạn..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
          />
          <button onClick={handlePost} disabled={loading}>
            Gửi bình luận
          </button>
        </div>
      ) : (
        <p className="login-prompt">
          Vui lòng <a href="/auth/login">đăng nhập</a> để bình luận.
        </p>
      )}

      <ul className="comment-list">
        {comments.length > 0 ? (
          renderComments
        ) : (
          <p className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        )}
      </ul>

      {total > itemsPerPage && (
        <ReactPaginate
          breakLabel="..."
          nextLabel="Tiếp >"
          onPageChange={(event) => loadComments(event.selected + 1)}
          pageRangeDisplayed={5}
          pageCount={Math.ceil(total / itemsPerPage)}
          previousLabel="< Trước"
          renderOnZeroPageCount={null}
          containerClassName="pagination"
          pageClassName="pagination-page"
          activeClassName="pagination-active"
          disabledClassName="pagination-disabled"
        />
      )}
    </div>
  );
};

export default CommentSection;