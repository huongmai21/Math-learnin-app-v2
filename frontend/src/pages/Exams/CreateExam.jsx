import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./Exam.css";

const CreateExam = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(60);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      questionType: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      images: [],
      preview: "",
    },
  ]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  useEffect(() => {
    if (!user || !["admin", "teacher"].includes(user.role)) {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/exams");
    }
  }, [user, navigate]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        questionType: "multiple-choice",
        options: ["", "", "", ""],
        correctAnswer: "",
        images: [],
        preview: "",
      },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      toast.error("Phải có ít nhất 1 câu hỏi!");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value, optionIndex = null) => {
    const newQuestions = [...questions];
    if (field === "options") {
      newQuestions[index].options[optionIndex] = value;
      if (
        newQuestions[index].questionType === "multiple-choice" &&
        newQuestions[index].correctAnswer &&
        !newQuestions[index].options.includes(newQuestions[index].correctAnswer)
      ) {
        newQuestions[index].correctAnswer = value;
      }
    } else if (field === "questionText") {
      newQuestions[index][field] = value;
      try {
        const html = katex.renderToString(value, {
          throwOnError: false,
          displayMode: false,
        });
        newQuestions[index].preview = html;
      } catch (error) {
        newQuestions[index].preview = value;
      }
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        const newQuestions = [...questions];
        newQuestions[index].images.push(data.imageUrl);
        setQuestions(newQuestions);
      } else {
        toast.error("Không thể tải lên hình ảnh!");
      }
    } catch (error) {
      toast.error("Lỗi khi tải lên hình ảnh!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/exams/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          educationLevel,
          subject,
          duration,
          startTime,
          endTime,
          difficulty,
          questions,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Tạo bài thi thành công!");
        navigate("/exams");
      } else {
        toast.error(data.message || "Lỗi khi tạo bài thi");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi server");
    }
  };

  if (!user || !["admin", "teacher"].includes(user.role)) {
    return null;
  }

  return (
    <div className="create-exam">
      <h1>Tạo Bài Thi</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tiêu đề:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mô tả:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Cấp học:</label>
          <select
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            required
          >
            <option value="">Chọn cấp học</option>
            {[...Array(12).keys()].map((i) => (
              <option key={i + 1} value={`grade${i + 1}`}>
                Lớp {i + 1}
              </option>
            ))}
            <option value="university">Đại học</option>
          </select>
        </div>
        <div>
          <label>Môn học:</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          >
            <option value="">Chọn môn học</option>
            {educationLevel === "university" ? (
              <>
                <option value="advanced_math">Toán cao cấp</option>
                <option value="calculus">Giải tích</option>
                <option value="algebra">Đại số</option>
                <option value="probability_statistics">Xác suất thống kê</option>
                <option value="differential_equations">Phương trình vi phân</option>
              </>
            ) : (
              <option value="math">Toán</option>
            )}
          </select>
        </div>
        <div>
          <label>Thời gian làm bài (phút):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min="1"
            required
          />
        </div>
        <div>
          <label>Thời gian bắt đầu:</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Thời gian kết thúc:</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Độ khó:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            required
          >
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
        </div>
        <h3>Câu hỏi</h3>
        {questions.map((q, index) => (
          <div key={index} className="question-block">
            <label>Câu hỏi (hỗ trợ LaTeX):</label>
            <input
              type="text"
              value={q.questionText}
              onChange={(e) =>
                updateQuestion(index, "questionText", e.target.value)
              }
              required
              placeholder="Ví dụ: $x^2 + y^2 = 1$"
            />
            <div className="preview">
              <label>Xem trước:</label>
              <div
                dangerouslySetInnerHTML={{ __html: q.preview || q.questionText }}
              />
            </div>
            <label>Tải lên hình ảnh minh họa:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(index, e)}
            />
            {q.images.length > 0 && (
              <div className="uploaded-images">
                {q.images.map((img, i) => (
                  <img key={i} src={img} alt={`Hình minh họa ${i}`} width="100" />
                ))}
              </div>
            )}
            <label>Loại câu hỏi:</label>
            <select
              value={q.questionType}
              onChange={(e) =>
                updateQuestion(index, "questionType", e.target.value)
              }
            >
              <option value="multiple-choice">Trắc nghiệm</option>
              <option value="true-false">Đúng/Sai</option>
              <option value="fill-in">Điền khuyết</option>
              <option value="essay">Tự luận</option>
              <option value="math-equation">Nhập công thức toán</option>
            </select>
            {q.questionType === "multiple-choice" && (
              <>
                <label>Lựa chọn:</label>
                {q.options.map((option, i) => (
                  <input
                    key={i}
                    type="text"
                    value={option}
                    onChange={(e) =>
                      updateQuestion(index, "options", e.target.value, i)
                    }
                    placeholder={`Lựa chọn ${i + 1}`}
                    required
                  />
                ))}
                <label>Đáp án đúng:</label>
                <input
                  type="text"
                  value={q.correctAnswer}
                  onChange={(e) =>
                    updateQuestion(index, "correctAnswer", e.target.value)
                  }
                  required
                />
              </>
            )}
            {q.questionType === "true-false" && (
              <>
                <label>Đáp án đúng:</label>
                <select
                  value={q.correctAnswer}
                  onChange={(e) =>
                    updateQuestion(index, "correctAnswer", e.target.value)
                  }
                  required
                >
                  <option value="true">Đúng</option>
                  <option value="false">Sai</option>
                </select>
              </>
            )}
            {(q.questionType === "fill-in" || q.questionType === "essay" || q.questionType === "math-equation") && (
              <>
                <label>Đáp án đúng:</label>
                <input
                  type="text"
                  value={q.correctAnswer}
                  onChange={(e) =>
                    updateQuestion(index, "correctAnswer", e.target.value)
                  }
                  required
                  placeholder={q.questionType === "math-equation" ? "Ví dụ: $x = 5$" : ""}
                />
              </>
            )}
            <button type="button" onClick={() => removeQuestion(index)}>
              Xóa câu hỏi
            </button>
          </div>
        ))}
        <button type="button" onClick={addQuestion}>
          Thêm câu hỏi
        </button>
        <button type="submit">Tạo bài thi</button>
      </form>
    </div>
  );
};

export default CreateExam;