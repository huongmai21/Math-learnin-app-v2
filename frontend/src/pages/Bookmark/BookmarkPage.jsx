import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { toast } from "react-toastify";
import { getBookmarks, removeBookmark } from "../../services/bookmarkService";
import { getNewsById } from "../../services/newsService";
import CommentSection from "../../components/common/CommentSection/CommentSection";
import "./Bookmarks.css";

const BookmarksPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để xem bookmarks");
      return;
    }
    const loadBookmarks = async () => {
      try {
        setLoading(true);
        const response = await getBookmarks("news");
        setBookmarks(response.data || []);
      } catch (error) {
        toast.error("Không thể tải bookmarks: " + (error.message || "Vui lòng thử lại"));
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, [user]);

  const handleNewsClick = async (bookmark) => {
    try {
      const result = await getNewsById(bookmark.referenceId);
      if (result.success) {
        setSelectedNews(result.news);
      }
    } catch (error) {
      toast.error("Không thể tải bài viết: " + (error.message || "Vui lòng thử lại"));
    }
  };

  const handleRemoveBookmark = async (referenceId) => {
    try {
      await removeBookmark("news", referenceId);
      setBookmarks(bookmarks.filter((bookmark) => bookmark.referenceId !== referenceId));
      toast.success("Đã xóa bookmark thành công!");
    } catch (error) {
      toast.error("Không thể xóa bookmark: " + (error.message || "Vui lòng thử lại"));
    }
  };

  const closeNewsDetail = () => {
    setSelectedNews(null);
  };

  const BookmarkRow = ({ index, style }) => {
    const bookmark = bookmarks[index];
    const news = bookmark.reference; // Được populate từ backend

    return (
      <div style={style} className="bookmark-item">
        {news.image && (
          <img
            src={news.image}
            alt={news.title}
            className="bookmark-image"
            onClick={() => handleNewsClick(bookmark)}
          />
        )}
        <div className="bookmark-content">
          <h2 onClick={() => handleNewsClick(bookmark)}>{news.title}</h2>
          <div className="bookmark-meta">
            <span>
              <i className="fas fa-user"></i> {news.author?.fullName || news.author?.username}
            </span>
            <span>
              <i className="fas fa-calendar"></i> {new Date(news.publishedAt).toLocaleDateString()}
            </span>
          </div>
          <p>{news.summary || news.content.slice(0, 150) + "..."}</p>
          <button
            className="remove-bookmark-button"
            onClick={() => handleRemoveBookmark(bookmark.referenceId)}
          >
            <i className="fas fa-trash"></i> Xóa
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-container">
        <h1>Danh sách đã lưu</h1>

        {loading && <div className="loading-spinner"></div>}

        {bookmarks.length === 0 && !loading ? (
          <p className="no-bookmarks">Bạn chưa lưu bài viết nào.</p>
        ) : (
          <div className="bookmarks-list" style={{ height: "600px" }}>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  width={width}
                  itemCount={bookmarks.length}
                  itemSize={300}
                >
                  {BookmarkRow}
                </List>
              )}
            </AutoSizer>
          </div>
        )}

        {selectedNews && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button onClick={closeNewsDetail} className="modal-close-btn">
                <i className="fas fa-times"></i>
              </button>
              {selectedNews.image && (
                <img
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  className="modal-image"
                />
              )}
              <h2>{selectedNews.title}</h2>
              {selectedNews.category === "math-magazine" && selectedNews.issueNumber && selectedNews.year && (
                <div className="magazine-meta">
                  <span>Số kỳ: {selectedNews.issueNumber}</span>
                  <span>Năm: {selectedNews.year}</span>
                </div>
              )}
              <div className="news-meta">
                <span>
                  <i className="fas fa-user"></i> {selectedNews.author?.fullName || selectedNews.author?.username}
                </span>
                <span>
                  <i className="fas fa-calendar"></i> {new Date(selectedNews.publishedAt).toLocaleDateString()}
                </span>
                <span>
                  <i className="fas fa-eye"></i> {selectedNews.views} lượt xem
                </span>
              </div>
              <div className="news-content-full">{selectedNews.content}</div>
              {selectedNews.tags && selectedNews.tags.length > 0 && (
                <div className="news-tags">
                  Tags: {selectedNews.tags.join(", ")}
                </div>
              )}
              {selectedNews.category === "math-magazine" && selectedNews.pdfUrl && (
                <div className="modal-actions">
                  <a
                    href={selectedNews.pdfUrl}
                    className="download-button"
                    download
                  >
                    <i className="fas fa-download"></i> Tải về
                  </a>
                </div>
              )}
              <CommentSection referenceId={selectedNews._id} referenceType="article" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;