"use client"

import { useState } from "react"

const CreateExamTab = ({
  profileData,
  myExams = [],
  newExam,
  setNewExam,
  editingExam,
  setEditingExam,
  handleCreateExam,
  handleUpdateExam,
  handleEditClick,
  handleDeleteExam,
}) => {
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
  })

  const handleAddQuestion = () => {
    if (!currentQuestion.question || currentQuestion.options.some((opt) => !opt)) {
      alert("Vui lòng điền đầy đủ câu hỏi và các lựa chọn")
      return
    }

    setNewExam({
      ...newExam,
      questions: [...newExam.questions, { ...currentQuestion }],
    })

    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    })

    setShowQuestionForm(false)
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options]
    newOptions[index] = value
    setCurrentQuestion({ ...currentQuestion, options: newOptions })
  }

  const handleRemoveQuestion = (index) => {
    setNewExam({
      ...newExam,
      questions: newExam.questions.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="create-exam-tab">
      <div className="exam-header">
        <h2>Tạo đề thi</h2>
      </div>

      <div className="exam-form-section">
        <h3>{editingExam ? "Chỉnh sửa đề thi" : "Tạo đề thi mới"}</h3>
        <form onSubmit={editingExam ? handleUpdateExam : handleCreateExam}>
          <div className="form-group">
            <label htmlFor="exam-title">Tiêu đề</label>
            <input
              type="text"
              id="exam-title"
              value={newExam.title}
              onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
              placeholder="Nhập tiêu đề đề thi..."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="exam-description">Mô tả</label>
            <textarea
              id="exam-description"
              value={newExam.description}
              onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
              placeholder="Nhập mô tả đề thi..."
              rows="3"
            ></textarea>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="exam-level">Cấp học</label>
              <select
                id="exam-level"
                value={newExam.educationLevel}
                onChange={(e) => setNewExam({ ...newExam, educationLevel: e.target.value })}
              >
                <option value="grade1">Lớp 1</option>
                <option value="grade2">Lớp 2</option>
                <option value="grade3">Lớp 3</option>
                <option value="grade4">Lớp 4</option>
                <option value="grade5">Lớp 5</option>
                <option value="grade6">Lớp 6</option>
                <option value="grade7">Lớp 7</option>
                <option value="grade8">Lớp 8</option>
                <option value="grade9">Lớp 9</option>
                <option value="grade10">Lớp 10</option>
                <option value="grade11">Lớp 11</option>
                <option value="grade12">Lớp 12</option>
                <option value="university">Đại học</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="exam-subject">Môn học</label>
              <select
                id="exam-subject"
                value={newExam.subject}
                onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
              >
                <option value="math">Toán</option>
                <option value="physics">Vật lý</option>
                <option value="chemistry">Hóa học</option>
                <option value="biology">Sinh học</option>
                <option value="literature">Văn học</option>
                <option value="history">Lịch sử</option>
                <option value="geography">Địa lý</option>
                <option value="english">Tiếng Anh</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="exam-duration">Thời gian (phút)</label>
              <input
                type="number"
                id="exam-duration"
                value={newExam.duration}
                onChange={(e) => setNewExam({ ...newExam, duration: Number.parseInt(e.target.value) || 60 })}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="exam-difficulty">Độ khó</label>
              <select
                id="exam-difficulty"
                value={newExam.difficulty}
                onChange={(e) => setNewExam({ ...newExam, difficulty: e.target.value })}
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="exam-start">Thời gian bắt đầu</label>
              <input
                type="datetime-local"
                id="exam-start"
                value={newExam.startTime}
                onChange={(e) => setNewExam({ ...newExam, startTime: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="exam-end">Thời gian kết thúc</label>
              <input
                type="datetime-local"
                id="exam-end"
                value={newExam.endTime}
                onChange={(e) => setNewExam({ ...newExam, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="questions-section">
            <div className="questions-header">
              <h4>Câu hỏi ({newExam.questions.length})</h4>
              <button type="button" className="btn-secondary" onClick={() => setShowQuestionForm(true)}>
                <i className="fas fa-plus"></i> Thêm câu hỏi
              </button>
            </div>

            {showQuestionForm && (
              <div className="question-form">
                <h4>Thêm câu hỏi mới</h4>
                <div className="form-group">
                  <label htmlFor="question-text">Câu hỏi</label>
                  <textarea
                    id="question-text"
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                    placeholder="Nhập câu hỏi..."
                    rows="2"
                    required
                  ></textarea>
                </div>
                <div className="options-group">
                  <label>Các lựa chọn</label>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="option-item">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={currentQuestion.correctAnswer === index}
                        onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Lựa chọn ${index + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label htmlFor="question-explanation">Giải thích (tùy chọn)</label>
                  <textarea
                    id="question-explanation"
                    value={currentQuestion.explanation}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                    placeholder="Nhập giải thích cho đáp án đúng..."
                    rows="2"
                  ></textarea>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-primary" onClick={handleAddQuestion}>
                    <i className="fas fa-plus"></i> Thêm câu hỏi
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowQuestionForm(false)}>
                    <i className="fas fa-times"></i> Hủy
                  </button>
                </div>
              </div>
            )}

            {newExam.questions.length > 0 ? (
              <div className="questions-list">
                {newExam.questions.map((q, index) => (
                  <div key={index} className="question-item">
                    <div className="question-header">
                      <h5>Câu hỏi {index + 1}</h5>
                      <button type="button" className="remove-question-btn" onClick={() => handleRemoveQuestion(index)}>
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                    <p className="question-text">{q.question}</p>
                    <div className="question-options">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className={`option ${optIndex === q.correctAnswer ? "correct" : ""}`}>
                          <span className="option-marker">{String.fromCharCode(65 + optIndex)}.</span>
                          <span className="option-text">{opt}</span>
                        </div>
                      ))}
                    </div>
                    {q.explanation && <p className="question-explanation">Giải thích: {q.explanation}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-questions">
                <p>Chưa có câu hỏi nào. Hãy thêm câu hỏi cho đề thi.</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <i className={editingExam ? "fas fa-save" : "fas fa-plus"}></i>{" "}
              {editingExam ? "Cập nhật đề thi" : "Tạo đề thi"}
            </button>
            {editingExam && (
              <button type="button" className="btn-secondary" onClick={() => setEditingExam(null)}>
                <i className="fas fa-times"></i> Hủy chỉnh sửa
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="my-exams-section">
        <h3>Đề thi của tôi</h3>
        {myExams.length > 0 ? (
          <div className="exams-table">
            <table>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Môn học</th>
                  <th>Cấp học</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {myExams.map((exam) => (
                  <tr key={exam._id}>
                    <td>{exam.title}</td>
                    <td>{exam.subject === "math" ? "Toán" : exam.subject}</td>
                    <td>
                      {exam.educationLevel === "university"
                        ? "Đại học"
                        : `Lớp ${exam.educationLevel.replace("grade", "")}`}
                    </td>
                    <td>{exam.duration} phút</td>
                    <td>
                      <span className={`status-badge ${exam.status}`}>
                        {exam.status === "pending"
                          ? "Chờ duyệt"
                          : exam.status === "approved"
                            ? "Đã duyệt"
                            : "Bị từ chối"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditClick(exam)}
                          disabled={exam.status === "approved"}
                          title={
                            exam.status === "approved" ? "Không thể chỉnh sửa đề thi đã được duyệt" : "Chỉnh sửa đề thi"
                          }
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteExam(exam._id)} title="Xóa đề thi">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <p>Bạn chưa tạo đề thi nào</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateExamTab
