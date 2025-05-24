const Exam = require("../models/Exam");
const ExamResult = require("../models/ExamResult");
const ExamQuestion = require("../models/ExamQuestion");
const Notification = require("../models/Notification");
const User = require("../models/User");

exports.getAllExams = async (req, res) => {
  try {
    const {
      educationLevel,
      subject,
      status,
      difficulty,
      search,
      page = 1,
      limit = 9,
    } = req.query;
    const skip = (page - 1) * limit;
    const now = new Date();

    let query = { isPublic: true };
    if (educationLevel) query.educationLevel = educationLevel;
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      if (status === "upcoming") query.startTime = { $gt: now };
      else if (status === "ongoing") {
        query.startTime = { $lte: now };
        query.endTime = { $gte: now };
      } else if (status === "ended") query.endTime = { $lt: now };
    }

    const exams = await Exam.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username fullName");

    const total = await Exam.countDocuments(query);

    res.status(200).json({
      success: true,
      count: exams.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      exams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đề thi!",
      error: error.message,
    });
  }
};

exports.followExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đề thi!" });
    }

    if (exam.followers.includes(req.user.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Bạn đã quan tâm bài thi này!" });
    }

    exam.followers.push(req.user.id);
    await exam.save();

    const reminderTime = new Date(exam.startTime.getTime() - 30 * 60 * 1000);
    if (reminderTime > new Date()) {
      const notification = new Notification({
        recipient: req.user.id,
        type: "new_exam",
        title: "Nhắc nhở bài thi",
        message: `Bài thi "${exam.title}" sẽ bắt đầu lúc ${exam.startTime.toLocaleString()}.`,
        link: `/exams/${exam._id}`,
        relatedModel: "Exam",
        relatedId: exam._id,
        importance: "high",
        createdAt: reminderTime,
      });
      await notification.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Quan tâm bài thi thành công!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Quan tâm bài thi thất bại!",
      error: error.message,
    });
  }
};

exports.getExamAnswers = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("questions");
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đề thi!" });
    }

    const now = new Date();
    if (exam.endTime > now) {
      return res
        .status(403)
        .json({ success: false, message: "Bài thi chưa kết thúc!" });
    }

    res.status(200).json({
      success: true,
      exam: {
        title: exam.title,
        questions: exam.questions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy đáp án!",
      error: error.message,
    });
  }
};

exports.getRecommendedExams = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = req.user;

    const examResults = await ExamResult.find({ user: userId }).populate(
      "exam"
    );

    const preferredLevels = [
      ...new Set(examResults.map((result) => result.exam.educationLevel)),
    ];
    const preferredSubjects = [
      ...new Set(examResults.map((result) => result.exam.subject)),
    ];

    let recommendedExams = await Exam.find({
      isPublic: true,
      educationLevel: {
        $in:
          preferredLevels.length > 0
            ? preferredLevels
            : ["grade1", "university"],
      },
      subject: {
        $in: preferredSubjects.length > 0 ? preferredSubjects : ["math"],
      },
      _id: { $nin: examResults.map((result) => result.exam._id) },
    })
      .sort({ attempts: -1 })
      .limit(5);

    if (recommendedExams.length === 0) {
      recommendedExams = await Exam.find({
        isPublic: true,
        educationLevel: user.educationLevel || "university",
      })
        .sort({ attempts: -1 })
        .limit(5);
    }

    res.status(200).json({
      success: true,
      recommendedExams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể gợi ý bài thi!",
      error: error.message,
    });
  }
};

exports.createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      educationLevel,
      subject,
      duration,
      questions,
      startTime,
      endTime,
      difficulty,
    } = req.body;

    const exam = new Exam({
      title,
      description,
      author: req.user.id,
      educationLevel,
      subject,
      duration: duration || 60,
      questions,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      difficulty,
      isPublic: true,
    });

    await exam.save();
    res.status(201).json({
      success: true,
      message: "Tạo đề thi thành công!",
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể tạo đề thi!",
      error: error.message,
    });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đề thi!" });
    }

    if (exam.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa đề thi này!",
      });
    }

    const updatedData = { ...req.body };
    if (updatedData.startTime)
      updatedData.startTime = new Date(updatedData.startTime);
    if (updatedData.endTime)
      updatedData.endTime = new Date(updatedData.endTime);

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Cập nhật đề thi thành công!",
      exam: updatedExam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật đề thi!",
      error: error.message,
    });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đề thi!" });
    }

    if (exam.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa đề thi này!",
      });
    }

    await Exam.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Xóa đề thi thành công!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể xóa đề thi!",
      error: error.message,
    });
  }
};

exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const { educationLevel, subject, timeRange } = req.query;

    let matchQuery = {};
    if (educationLevel) matchQuery["exam.educationLevel"] = educationLevel;
    if (subject) matchQuery["exam.subject"] = subject;
    if (timeRange) {
      const now = new Date();
      let startDate;
      if (timeRange === "weekly") {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (timeRange === "monthly") {
        startDate = new Date(
          now.setFullYear(now.getFullYear(), now.getMonth() - 1)
        );
      }
      matchQuery.endTime = { $gte: startDate };
    }

    const leaderboard = await ExamResult.aggregate([
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "exam",
        },
      },
      { $unwind: "$exam" },
      { $match: matchQuery },
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$totalScore" },
          totalExams: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          username: "$user.username",
          totalScore: 1,
          totalExams: 1,
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 10 },
    ]);

    const badgeTypes = ["gold", "silver", "bronze"];
    for (let i = 0; i < Math.min(3, leaderboard.length); i++) {
      const user = await User.findById(leaderboard[i]._id);
      if (!user.badges.some((badge) => badge.type === badgeTypes[i])) {
        user.badges.push({ type: badgeTypes[i] });
        await user.save();
      }
      leaderboard[i].badge = badgeTypes[i];
    }

    res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy bảng xếp hạng!",
      error: error.message,
    });
  }
};

exports.getExamLeaderboard = async (req, res) => {
  try {
    const examId = req.params.id;
    const leaderboard = await ExamResult.find({ exam: examId })
      .populate("user", "username")
      .sort({ totalScore: -1, endTime: 1 })
      .limit(10)
      .select("user totalScore endTime");

    res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy bảng xếp hạng bài thi!",
      error: error.message,
    });
  }
};

exports.submitExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("questions");
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đề thi!" });
    }

    const now = new Date();
    if (now < exam.startTime || now > exam.endTime) {
      return res
        .status(403)
        .json({ success: false, message: "Bài thi không trong thời gian làm!" });
    }

    const previousAttempts = await ExamResult.countDocuments({
      exam: req.params.id,
      user: req.user.id,
    });
    if (previousAttempts >= exam.maxAttempts) {
      return res
        .status(403)
        .json({ success: false, message: "Bạn đã hết lượt làm bài!" });
    }

    const { answers } = req.body;
    let totalScore = 0;

    const examResult = new ExamResult({
      exam: req.params.id,
      user: req.user.id,
      answers: [],
      totalScore,
      startTime: new Date(),
      endTime: now,
      completed: true,
    });

    for (const question of exam.questions) {
      const questionDoc = await ExamQuestion.findById(question._id);
      if (!questionDoc) continue;

      const userAnswer = answers[question._id] || "";
      let isCorrect = false;
      let score = 0;

      switch (questionDoc.questionType) {
        case "multiple-choice":
          isCorrect = questionDoc.options.some(
            (opt) => opt.text === userAnswer && opt.isCorrect === true
          );
          score = isCorrect ? questionDoc.points : 0;
          break;
        case "true-false":
          isCorrect = userAnswer === questionDoc.correctAnswer;
          score = isCorrect ? questionDoc.points : 0;
          break;
        case "fill-in":
        case "essay":
          isCorrect = userAnswer.toString().trim() === questionDoc.correctAnswer.toString().trim();
          score = isCorrect ? questionDoc.points : 0;
          break;
        case "math-equation":
          // Loại bỏ ký hiệu $ để so sánh
          const cleanUserAnswer = userAnswer.replace(/\$/g, '').trim();
          const cleanCorrectAnswer = questionDoc.correctAnswer.replace(/\$/g, '').trim();
          isCorrect = cleanUserAnswer === cleanCorrectAnswer;
          score = isCorrect ? questionDoc.points : 0;
          break;
      }

      totalScore += score;
      examResult.answers.push({
        question: question._id,
        userAnswer,
        isCorrect,
        score,
      });
    }

    examResult.totalScore = totalScore;
    await examResult.save();

    exam.attempts = (exam.attempts || 0) + 1;
    await exam.save();

    res.status(200).json({
      success: true,
      message: "Nộp bài thành công!",
      score: totalScore,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể nộp bài!",
      error: error.message,
    });
  }
};