const News = require("../models/News.js");

// Lấy tất cả tin tức (phân trang, lọc theo category và tìm kiếm)
exports.getAllNews = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const category = req.query.category || "education";
    const search = req.query.search?.toLowerCase() || "";

    const query = { category };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ];
    }

    const news = await News.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username fullName");

    const total = await News.countDocuments(query);

    res.status(200).json({
      success: true,
      count: news.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách tin tức!",
      error: error.message,
    });
  }
};

// Lấy tin tức nổi bật
exports.getFeaturedNews = async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 3;

    // Lấy tin tức nổi bật (featured: true, status: approved)
    let featuredNews = await News.find({ featured: true, status: "approved" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("author", "username avatar");

    // Nếu không đủ tin tức nổi bật, lấy thêm tin tức phổ biến hoặc mới nhất
    if (featuredNews.length < limit) {
      const additionalNews = await News.find({
        _id: { $nin: featuredNews.map((news) => news._id) },
        status: "approved",
      })
        .sort({ views: -1, createdAt: -1 })
        .limit(limit - featuredNews.length)
        .populate("author", "username avatar");

      featuredNews = [...featuredNews, ...additionalNews];
    }

    res.status(200).json({
      success: true,
      count: featuredNews.length,
      news: featuredNews,
    });
  } catch (error) {
    console.error("Error fetching featured news:", error);
    // Trả về mảng rỗng thay vì lỗi 500
    res.status(200).json({
      success: true,
      count: 0,
      news: [],
      message: "Không có tin tức nổi bật nào",
    });
  }
};

// Lấy chi tiết một tin tức
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate(
      "author",
      "username fullName"
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin tức!",
      });
    }

    // Tăng số lượt xem
    news.views += 1;
    await news.save();

    res.status(200).json({
      success: true,
      news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy chi tiết tin tức!",
      error: error.message,
    });
  }
};

// Tạo tin tức mới (chỉ admin và giáo viên)
exports.createNews = async (req, res) => {
  try {
    // Kiểm tra quyền hạn
    if (req.user.role !== "admin" && req.user.role !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện hành động này!",
      });
    }

    const { title, content, summary, thumbnail, image, tags, category } =
      req.body;

    const newNews = new News({
      title,
      content,
      summary,
      author: req.user.id,
      thumbnail,
      image,
      tags,
      category,
    });

    await newNews.save();

    res.status(201).json({
      success: true,
      message: "Tạo tin tức thành công!",
      news: newNews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Tạo tin tức thất bại!",
      error: error.message,
    });
  }
};

// Cập nhật tin tức
exports.updateNews = async (req, res) => {
  try {
    const { title, content, summary, thumbnail, image, tags, category } =
      req.body;

    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin tức!",
      });
    }

    // Kiểm tra quyền sửa tin tức
    if (news.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa tin tức này!",
      });
    }

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        summary,
        thumbnail,
        image,
        tags,
        category,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật tin tức thành công!",
      news: updatedNews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cập nhật tin tức thất bại!",
      error: error.message,
    });
  }
};

// Xóa tin tức
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin tức!",
      });
    }

    // Kiểm tra quyền xóa tin tức
    if (news.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa tin tức này!",
      });
    }

    await News.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Xóa tin tức thành công!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Xóa tin tức thất bại!",
      error: error.message,
    });
  }
};

// Tìm kiếm gợi ý (autocomplete)
exports.getNewsSuggestions = async (req, res) => {
  try {
    const query = req.query.query?.toLowerCase() || "";
    if (!query) {
      return res.status(200).json({
        success: true,
        suggestions: [],
      });
    }

    const suggestions = await News.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { summary: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ],
    })
      .limit(5)
      .select("title");

    res.status(200).json({
      success: true,
      suggestions: suggestions.map((news) => news.title),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy gợi ý tin tức!",
      error: error.message,
    });
  }
};
