import React, { useState, useEffect, useRef } from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import io from "socket.io-client";
import { Tooltip } from "react-tooltip";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { getNews, getNewsById, getNewsSuggestions, updateNews } from "../../services/newsService";
import { addBookmark, removeBookmark, checkBookmarks } from "../../services/bookmarkService";
import CommentSection from "../../components/common/CommentSection/CommentSection";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import "./News.css";

const NewsPage = ({ category, title }) => {
  const { user } = useSelector((state) => state.auth);
  const [newsData, setNewsData] = useState({ news: [], total: 0, totalPages: 0, currentPage: 1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [bookmarkedNewsIds, setBookmarkedNewsIds] = useState([]);
  const [bookmarkLoading, setBookmarkLoading] = useState({});
  const [pdfFile, setPdfFile] = useState(null);
  const socketRef = useRef(null);

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

  const loadBookmarkedNewsIds = async (newsItems) => {
    if (!user || !newsItems || newsItems.length === 0) return;
    try {
      const newsIds = newsItems.map((item) => item._id);
      const response = await checkBookmarks("news", newsIds);
      setBookmarkedNewsIds(response.data || []);
    } catch (error) {
      console.error("Error checking bookmarks:", error);
    }
  };

  useEffect(() => {
    const loadNews = async () => {
      const result = await getNews(1, searchQuery, category);
      setNewsData(result);
      await loadBookmarkedNewsIds(result.news);
    };
    loadNews();
  }, [searchQuery, category]);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (searchQuery.trim()) {
        const response = await getNewsSuggestions(searchQuery);
        setSuggestions(response.suggestions || []);
      } else {
        setSuggestions([]);
      }
    };
    loadSuggestions();
  }, [searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePageChange = (event) => {
    const newPage = event.selected + 1;
    getNews(newPage, searchQuery, category).then((result) => {
      setNewsData(result);
      loadBookmarkedNewsIds(result.news);
    });
  };

  const handleNewsClick = async (id) => {
    const result = await getNewsById(id);
    if (result.success) {
      setSelectedNews(result.news);
    }
  };

  const closeNewsDetail = () => {
    setSelectedNews(null);
    setPdfFile(null);
  };

  const handleBookmarkNews = async (newsId) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh dấu tin tức");
      return;
    }
    setBookmarkLoading((prev) => ({ ...prev, [newsId]: true }));
    try {
      const isBookmarked = bookmarkedNewsIds.includes(newsId);
      if (isBookmarked) {
        await removeBookmark("news", newsId);
        setBookmarkedNewsIds(bookmarkedNewsIds.filter((id) => id !== newsId));
        socketRef.current.emit("bookmark", {
          userId: user._id,
          referenceType: "news",
          referenceId: newsId,
          action: "remove",
        });
      } else {
        await addBookmark("news", newsId);
        setBookmarkedNewsIds([...bookmarkedNewsIds, newsId]);
        socketRef.current.emit("bookmark", {
          userId: user._id,
          referenceType: "news",
          referenceId: newsId,
          action: "add",
        });
      }
    } catch (error) {
      toast.error(error.message || "Không thể đánh dấu tin tức");
    } finally {
      setBookmarkLoading((prev) => ({ ...prev, [newsId]: false }));
    }
  };

  const handleShare = async (news) => {
    const shareUrl = `${window.location.origin}/news/${news._id}`;
    const shareData = {
      title: news.title,
      text: news.summary || news.content.slice(0, 150) + "...",
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Đã sao chép liên kết bài viết!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Không thể chia sẻ bài viết");
    }
  };

  const handlePdfUpload = async (e) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để tải lên PDF");
      return;
    }
    const file = e.target.files[0];
    if (!file || !file.type.includes("pdf")) {
      toast.error("Vui lòng chọn file PDF hợp lệ!");
      return;
    }
    setPdfFile(file);
  };

  const handlePdfSubmit = async () => {
    if (!pdfFile) {
      toast.error("Vui lòng chọn file PDF để tải lên!");
      return;
    }
    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("folder", "math-magazine");

    try {
      const response = await fetch("/upload/file", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        const updatedNews = { ...selectedNews, pdfUrl: data.url };
        await updateNews(selectedNews._id, { pdfUrl: data.url });
        setSelectedNews(updatedNews);
        toast.success("Đã tải lên PDF thành công!");
      }
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Không thể tải lên PDF");
    }
  };

  const NewsRow = ({ index, style }) => {
    const item = newsData.news[index];
    const isBookmarked = bookmarkedNewsIds.includes(item._id);

    return (
      <div style={style} className="news-item">
        {item.image && (
          <img
            src={item.image}
            alt={item.title}
            className="news-image"
            onClick={() => handleNewsClick(item._id)}
          />
        )}
        <div className="news-content">
          <h2 onClick={() => handleNewsClick(item._id)}>{item.title}</h2>
          <div className="news-meta">
            <span>
              <i className="fas fa-user"></i> {item.author?.fullName || item.author?.username}
            </span>
            <span>
              <i className="fas fa-calendar"></i> {new Date(item.publishedAt).toLocaleDateString()}
            </span>
            <span>
              <i className="fas fa-eye"></i> {item.views} lượt xem
            </span>
          </div>
          <p>{item.summary || item.content.slice(0, 150) + "..."}</p>
          {item.tags && item.tags.length > 0 && (
            <div className="news-tags">
              Tags: {item.tags.join(", ")}
            </div>
          )}
          {user && (
            <button
              className={`action-button ${isBookmarked ? "bookmarked" : ""}`}
              onClick={() => handleBookmarkNews(item._id)}
              disabled={bookmarkLoading[item._id]}
              data-tooltip-id={`tooltip-bookmark-news-${item._id}`}
              data-tooltip-content={isBookmarked ? "Bỏ lưu" : "Lưu tin tức"}
            >
              {bookmarkLoading[item._id] ? (
                <div className="spinner" style={{ width: "16px", height: "16px" }}></div>
              ) : (
                <i className="fas fa-bookmark"></i>
              )}
            </button>
          )}
          <Tooltip id={`tooltip-bookmark-news-${item._id}`} />
        </div>
      </div>
    );
  };

  return (
    <div className="news-page">
      <div className="news-container">
        <h1>{title}</h1>
        <SearchBar
          onSearch={handleSearch}
          placeholder={`Tìm kiếm ${title.toLowerCase()}...`}
          suggestions={suggestions}
        />
        
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
              {category === "math-magazine" && selectedNews.issueNumber && selectedNews.year && (
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
              <div className="modal-actions">
                <button
                  className="share-button"
                  onClick={() => handleShare(selectedNews)}
                >
                  <i className="fas fa-share"></i> Chia sẻ
                </button>
                {category === "math-magazine" && (
                  <>
                    {selectedNews.pdfUrl ? (
                      <a
                        href={selectedNews.pdfUrl}
                        className="download-button"
                        download
                      >
                        <i className="fas fa-download"></i> Tải về
                      </a>
                    ) : user && user.role === "admin" ? (
                      <>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handlePdfUpload}
                          className="pdf-upload-input"
                          id="pdf-upload"
                        />
                        <label htmlFor="pdf-upload" className="upload-button">
                          <i className="fas fa-upload"></i> Chọn PDF
                        </label>
                        <button
                          className="upload-button"
                          onClick={handlePdfSubmit}
                          disabled={!pdfFile}
                        >
                          <i className="fas fa-upload"></i> Tải lên
                        </button>
                      </>
                    ) : null}
                  </>
                )}
              </div>
              <CommentSection referenceId={selectedNews._id} referenceType="article" />
            </div>
          </div>
        )}

        <div className="news-list" style={{ height: "600px" }}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                itemCount={newsData.news.length}
                itemSize={300}
              >
                {NewsRow}
              </List>
            )}
          </AutoSizer>
        </div>

        {newsData.totalPages > 1 && (
          <div className="pagination">
            <ReactPaginate
              breakLabel="..."
              nextLabel="Tiếp >"
              onPageChange={handlePageChange}
              pageRangeDisplayed={5}
              pageCount={newsData.totalPages}
              previousLabel="< Trước"
              renderOnZeroPageCount={null}
              containerClassName="pagination-container"
              pageClassName="pagination-page"
              activeClassName="pagination-active"
              disabledClassName="pagination-disabled"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;