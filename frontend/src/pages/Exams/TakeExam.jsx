import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './Exam.css';

const TakeExam = () => {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/exams/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setExam(data.exam);
          setQuestions(data.exam.questions || []);
          setLoading(false);

          const savedAnswers = localStorage.getItem(`exam_${id}_answers`);
          if (savedAnswers) {
            setAnswers(JSON.parse(savedAnswers));
          }
        } else {
          toast.error(data.message || 'Không thể tải bài thi');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Không thể tải bài thi');
        setLoading(false);
      });

    const timer = setInterval(() => {
      if (exam) {
        const now = new Date();
        if (now < new Date(exam.startTime) || now > new Date(exam.endTime)) {
          clearInterval(timer);
          toast.error('Bài thi không trong thời gian làm!');
          navigate('/exams');
          return;
        }
        const endTime = new Date(exam.endTime);
        const timeDiff = endTime - now;
        if (timeDiff <= 0) {
          clearInterval(timer);
          toast.error('Hết thời gian làm bài!');
          submitExam();
        } else {
          setTimeLeft(formatTimeLeft(timeDiff));
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [id, exam, navigate]);

  const formatTimeLeft = (time) => {
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const selectAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    localStorage.setItem(`exam_${id}_answers`, JSON.stringify(newAnswers));
  };

  const saveProgress = () => {
    localStorage.setItem(`exam_${id}_answers`, JSON.stringify(answers));
    toast.success('Đã lưu tiến độ!');
  };

  const submitExam = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/exams/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(`Nộp bài thành công! Điểm: ${data.score}`);
        localStorage.removeItem(`exam_${id}_answers`);
        navigate('/exams');
      } else {
        toast.error(data.message || 'Lỗi khi nộp bài');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi server');
    }
  };

  const renderMath = (text) => {
    try {
      return katex.renderToString(text, {
        throwOnError: false,
        displayMode: false,
      });
    } catch (error) {
      return text;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép công thức!");
  };

  if (loading) return <p>Đang tải...</p>;
  if (!exam) return <p>Không tìm thấy bài thi</p>;

  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="take-exam">
      <h1>{exam.title}</h1>
      <p>{exam.description}</p>
      <p>Tiến độ: {answeredQuestions}/{questions.length} câu đã trả lời</p>
      {timeLeft && <div className="timer">Thời gian còn lại: {timeLeft}</div>}
      {questions.map((q, index) => (
        <div key={q._id} className="question">
          <h3>
            Câu {index + 1}:{" "}
            <span
              dangerouslySetInnerHTML={{ __html: renderMath(q.questionText) }}
            />
            <button
              onClick={() => copyToClipboard(q.questionText)}
              className="copy-button"
            >
              Copy
            </button>
          </h3>
          {q.images && q.images.length > 0 && (
            <div className="question-images">
              {q.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Hình minh họa ${i}`}
                  width="100"
                  onClick={() => setModalImage(img)}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
          )}
          {q.questionType === 'multiple-choice' ? (
            q.options.map((option, i) => (
              <div key={i}>
                <input
                  type="radio"
                  name={`question-${q._id}`}
                  value={option.text}
                  onChange={() => selectAnswer(q._id, option.text)}
                  checked={answers[q._id] === option.text}
                />
                <label>{option.text}</label>
              </div>
            ))
          ) : q.questionType === 'true-false' ? (
            <>
              <div>
                <input
                  type="radio"
                  name={`question-${q._id}`}
                  value="true"
                  onChange={() => selectAnswer(q._id, "true")}
                  checked={answers[q._id] === "true"}
                />
                <label>Đúng</label>
              </div>
              <div>
                <input
                  type="radio"
                  name={`question-${q._id}`}
                  value="false"
                  onChange={() => selectAnswer(q._id, "false")}
                  checked={answers[q._id] === "false"}
                />
                <label>Sai</label>
              </div>
            </>
          ) : q.questionType === 'fill-in' || q.questionType === 'essay' ? (
            <textarea
              onChange={(e) => selectAnswer(q._id, e.target.value)}
              value={answers[q._id] || ''}
              placeholder="Nhập câu trả lời của bạn"
            />
          ) : q.questionType === 'math-equation' ? (
            <input
              type="text"
              onChange={(e) => selectAnswer(q._id, e.target.value)}
              value={answers[q._id] || ''}
              placeholder="Nhập công thức (ví dụ: $x = 5$)"
            />
          ) : null}
        </div>
      ))}
      <button onClick={saveProgress}>Lưu tạm</button>
      <button onClick={submitExam}>Nộp bài</button>

      {modalImage && (
        <div className="modal" onClick={() => setModalImage(null)}>
          <div className="modal-content">
            <img src={modalImage} alt="Hình lớn" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeExam;