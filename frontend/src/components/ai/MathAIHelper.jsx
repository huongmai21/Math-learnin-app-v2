"use client";

import { useState, useRef, useEffect } from "react";
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner } from "react-icons/fa";
import { useSelector } from "react-redux";
import "./MathAIHelper.css";
import { askMathQuestion } from "../../services/aiService";

const MathAIHelper = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const chatContainerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  const toggleHelper = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question;
    setConversation([...conversation, { role: "user", content: userQuestion }]);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await askMathQuestion(userQuestion);
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: response.data.answer },
      ]);
    } catch (error) {
      console.error("Error asking math question:", error);
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Xin lỗi, tôi không thể trả lời câu hỏi của bạn lúc này. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Không hiển thị nếu chưa đăng nhập
  }

  return (
    <div className="math-ai-helper">
      <button
        ref={buttonRef}
        className="helper-toggle-button"
        onClick={toggleHelper}
        aria-label="Trợ lý toán học"
      >
        <FaRobot />
        <span>Trợ lý toán học</span>
      </button>

      <div className={`helper-container ${isOpen ? "open" : ""}`}>
        <div className="helper-header">
          <h3>Trợ lý toán học</h3>
          <button
            onClick={toggleHelper}
            className="close-button"
            aria-label="Đóng"
          >
            <FaTimes />
          </button>
        </div>

        <div className="helper-content" ref={chatContainerRef}>
          {conversation.length === 0 ? (
            <div className="welcome-message">
              <p>
                Xin chào, {user.username}! Tôi là trợ lý toán học. Bạn có thể hỏi tôi bất kỳ câu
                hỏi nào về toán học.
              </p>
              <p>Ví dụ:</p>
              <ul>
                <li>Giải phương trình x² + 5x + 6 = 0</li>
                <li>Tính đạo hàm của f(x) = sin(x²)</li>
                <li>Giải thích định lý Pythagoras</li>
              </ul>
            </div>
          ) : (
            conversation.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-content">
                  {msg.content.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message assistant loading">
              <div className="loading-indicator">
                <FaSpinner className="spinner" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="helper-input">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Nhập câu hỏi toán học của bạn..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            aria-label="Gửi"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MathAIHelper;