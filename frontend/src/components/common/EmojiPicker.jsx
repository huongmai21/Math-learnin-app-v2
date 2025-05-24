"use client";

import { useState } from "react";
import "./EmojiPicker.css";

// Danh sách emoji phổ biến
const EMOJI_CATEGORIES = {
  smileys: [
    "😀",
    "😁",
    "😂",
    "🤣",
    "😃",
    "😄",
    "😅",
    "😆",
    "😉",
    "😊",
    "😋",
    "😎",
    "😍",
    "😘",
    "🥰",
    "😗",
    "😙",
    "😚",
  ],
  gestures: [
    "👋",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "👇",
    "👍",
    "👎",
    "✊",
    "👊",
    "🤛",
    "🤜",
    "👏",
  ],
  symbols: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
  ],
  objects: [
    "📚",
    "📝",
    "📏",
    "📐",
    "✏️",
    "📌",
    "📍",
    "🔍",
    "🔎",
    "🔒",
    "🔓",
    "🔑",
    "🔨",
    "💻",
    "🖥️",
    "📱",
    "⌚",
    "📷",
  ],
  math: [
    "➕",
    "➖",
    "✖️",
    "➗",
    "💯",
    "❓",
    "❔",
    "🔢",
    "🔠",
    "🔡",
    "🔤",
    "🆎",
    "🆑",
    "🆒",
    "🆓",
    "🆔",
    "🆕",
    "🆖",
  ],
};

const EmojiPicker = ({ onEmojiSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("smileys");
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emoji) => {
    if (onEmojiSelect) {
      onEmojiSelect(emoji);
    }
    setIsOpen(false);
  };

  const filteredEmojis = searchTerm
    ? Object.values(EMOJI_CATEGORIES)
        .flat()
        .filter((emoji) => emoji.includes(searchTerm))
    : EMOJI_CATEGORIES[activeCategory];

  return (
    <div className="emoji-picker-wrapper">
      <button
        type="button"
        className="emoji-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chọn emoji"
      >
        <i className="fas fa-smile"></i>
      </button>

      {isOpen && (
        <div className="emoji-picker">
          <div className="emoji-search">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm emoji..."
            />
          </div>

          {!searchTerm && (
            <div className="emoji-categories">
              {Object.keys(EMOJI_CATEGORIES).map((category) => (
                <button
                  key={category}
                  className={`category-button ${
                    activeCategory === category ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category === "smileys"
                    ? "😀"
                    : category === "gestures"
                    ? "👋"
                    : category === "symbols"
                    ? "❤️"
                    : category === "objects"
                    ? "📚"
                    : "➕"}
                </button>
              ))}
            </div>
          )}

          <div className="emoji-list">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={index}
                className="emoji-button"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
