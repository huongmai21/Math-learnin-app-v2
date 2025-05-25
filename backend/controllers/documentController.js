const Document = require("../models/Document");
// const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const fs = require("fs").promises;
const path = require("path");
const mammoth = require("mammoth");
const TurndownService = require("turndown");

exports.createDocument = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorResponse("Chỉ admin mới có thể tạo tài liệu", 403));
  }

  let {
    title,
    description,
    content,
    educationLevel,
    grade,
    subject,
    documentType,
    tags,
  } = req.body;

  if (!req.files?.file) {
    return next(new ErrorResponse("File tài liệu là bắt buộc", 400));
  }

  let fileUrl = "";
  let public_id = "";
  let format = "";
  try {
    const uploadResult = await cloudinary.uploader.upload(
      req.files.file[0].path,
      {
        folder: `documents/${educationLevel}`,
        resource_type: "auto",
      }
    );
    fileUrl = uploadResult.secure_url;
    public_id = uploadResult.public_id;
    format = path
      .extname(req.files.file[0].originalname)
      .toLowerCase()
      .replace(".", "");
  } catch (err) {
    console.error("Cloudinary upload file error:", err);
    await fs
      .unlink(req.files.file[0].path)
      .catch((e) => console.error("Error deleting temp file:", e));
    return next(new ErrorResponse("Lỗi khi upload file lên Cloudinary", 500));
  } finally {
    await fs
      .unlink(req.files.file[0].path)
      .catch((e) => console.error("Error deleting temp file:", e));
  }

  let thumbnailUrl = "";
  if (req.files?.thumbnail) {
    try {
      const uploadResult = await cloudinary.uploader.upload(
        req.files.thumbnail[0].path,
        {
          folder: "thumbnails",
          resource_type: "image",
        }
      );
      thumbnailUrl = uploadResult.secure_url;
    } catch (err) {
      console.error("Cloudinary upload thumbnail error:", err);
      await fs
        .unlink(req.files.thumbnail[0].path)
        .catch((e) => console.error("Error deleting temp thumbnail:", e));
    } finally {
      await fs
        .unlink(req.files.thumbnail[0].path)
        .catch((e) => console.error("Error deleting temp thumbnail:", e));
    }
  }

  const document = await Document.create({
    title,
    description: description || "",
    content: content || "",
    fileUrl,
    public_id,
    format,
    thumbnail: thumbnailUrl,
    educationLevel,
    grade: educationLevel !== "university" ? grade : null,
    subject: educationLevel === "university" ? subject : null,
    documentType,
    tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
    uploadedBy: req.user.id,
  });

  // const users = await require("../models/User").find({ _id: { $ne: req.user.id } });
  // const notifications = users.map((user) => ({
  //   recipient: user._id,
  //   sender: req.user.id,
  //   type: "system",
  //   title: "Tài liệu mới",
  //   message: `Tài liệu "${title}" vừa được đăng tải.`,
  //   link: `/documents/detail/${document._id}`,
  //   relatedModel: "Document",
  //   relatedId: document._id,
  //   importance: "medium",
  // }));

  // await Notification.insertMany(notifications);
  // notifications.forEach((notif) => {
  //   global.io.to(notif.recipient.toString()).emit("newNotification", {
  //     _id: notif._id,
  //     title: notif.title,
  //     message: notif.message,
  //     link: notif.link,
  //     createdAt: new Date(),
  //   });
  // });

  // Debug
  console.log("FILES:", req.files);
  console.log("BODY:", req.body);
  res.status(201).json({ success: true, data: document });
});

// Thêm hàm updateDocument
exports.updateDocument = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse("Chỉ admin mới có thể cập nhật tài liệu", 403)
    );
  }

  const { id } = req.params;
  let {
    title,
    description,
    content,
    educationLevel,
    grade,
    subject,
    documentType,
    tags,
  } = req.body;

  const document = await Document.findById(id);
  if (!document) {
    return next(new ErrorResponse("Tài liệu không tồn tại", 404));
  }

  let fileUrl = document.fileUrl;
  let public_id = document.public_id;
  let format = document.format;
  if (req.files?.file) {
    try {
      // Xóa file cũ trên Cloudinary
      if (document.public_id) {
        await cloudinary.uploader.destroy(document.public_id);
      }
      const uploadResult = await cloudinary.uploader.upload(
        req.files.file[0].tempFilePath,
        {
          folder: `documents/${educationLevel}`,
          resource_type: "auto",
        }
      );
      fileUrl = uploadResult.secure_url;
      public_id = uploadResult.public_id;
      format = req.files.file[0].name.split(".").pop().toLowerCase();
    } catch (err) {
      return next(new ErrorResponse("Lỗi khi upload file mới", 500));
    }
  }

  let thumbnailUrl = document.thumbnail;
  if (req.files?.thumbnail) {
    try {
      const uploadResult = await cloudinary.uploader.upload(
        req.files.thumbnail[0].tempFilePath,
        {
          folder: "thumbnails",
          resource_type: "image",
        }
      );
      thumbnailUrl = uploadResult.secure_url;
    } catch (err) {
      return next(new ErrorResponse("Lỗi khi upload thumbnail mới", 500));
    }
  }

  document.title = title || document.title;
  document.description = description || document.description;
  document.content = content || document.content;
  document.fileUrl = fileUrl;
  document.public_id = public_id;
  document.format = format;
  document.thumbnail = thumbnailUrl;
  document.educationLevel = educationLevel || document.educationLevel;
  document.grade =
    educationLevel !== "university" ? grade || document.grade : null;
  document.subject =
    educationLevel === "university" ? subject || document.subject : null;
  document.documentType = documentType || document.documentType;
  document.tags = tags
    ? tags.split(",").map((tag) => tag.trim())
    : document.tags;

  await document.save();

  res.status(200).json({ success: true, data: document });
});

// Xóa tài liệu
exports.deleteDocument = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorResponse("Chỉ admin mới có thể xóa tài liệu", 403));
  }

  const { id } = req.params;
  const document = await Document.findById(id);
  if (!document) {
    return next(new ErrorResponse("Tài liệu không tồn tại", 404));
  }

  if (document.public_id) {
    await cloudinary.uploader.destroy(document.public_id);
  }

  await Document.findByIdAndDelete(id);

  // Xóa thumbnail nếu có
  if (document.thumbnail) {
    const thumbnailPublicId = document.thumbnail.split("/").pop().split(".")[0];
    try {
      await cloudinary.uploader.destroy(thumbnailPublicId, {
        resource_type: "image",
      });
    } catch (err) {
      console.error("Error deleting thumbnail from Cloudinary:", err);
    }
  }

  res.status(200).json({ success: true, message: "Xóa tài liệu thành công" });
});

// Lấy danh sách tài liệu với các bộ lọc và phân trang
exports.getDocuments = asyncHandler(async (req, res, next) => {
  const {
    educationLevel,
    grade,
    subject,
    documentType,
    tag,
    sortBy = "uploadedAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
    dateFrom,
    dateTo,
  } = req.query;

  let query = {};
  if (educationLevel) query.educationLevel = educationLevel;
  if (grade) query.grade = grade;
  if (educationLevel === "university" && subject) {
    query.subject = subject;
  } else if (subject) {
    return next(
      new ErrorResponse("Bộ lọc môn học chỉ áp dụng cho cấp Đại học", 400)
    );
  }
  if (documentType) query.documentType = documentType;
  if (tag) query.tags = { $in: [tag] };
  if (dateFrom)
    query.uploadedAt = { ...query.uploadedAt, $gte: new Date(dateFrom) };
  if (dateTo)
    query.uploadedAt = { ...query.uploadedAt, $lte: new Date(dateTo) };

  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  const documents = await Document.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("uploadedBy", "username avatar")
    .select(
      "title description thumbnail educationLevel grade subject documentType downloads views uploadedAt tags"
    );

  const total = await Document.countDocuments(query);

  res.status(200).json({
    success: true,
    data: documents || [],
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});

exports.getDocumentById = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id).populate(
    "uploadedBy",
    "username avatar"
  );
  if (!document) {
    return next(new ErrorResponse("Tài liệu không tồn tại", 404));
  }

  document.views += 1;
  await document.save();

  res.status(200).json({ success: true, data: document });
});

// exports.searchDocuments = asyncHandler(async (req, res, next) => {
//   const {
//     search,
//     educationLevel,
//     grade,
//     subject,
//     documentType,
//     tag,
//     page = 1,
//     limit = 10,
//     dateFrom,
//     dateTo,
//   } = req.query;

//   let query = {};
//   if (search) {
//     query.$or = [
//       { title: { $regex: search, $options: "i" } },
//       { description: { $regex: search, $options: "i" } },
//       { tags: { $regex: search, $options: "i" } },
//     ];
//   }
//   if (educationLevel) query.educationLevel = educationLevel;
//   if (grade) query.grade = grade;
//   if (educationLevel === "university" && subject) {
//     query.subject = subject;
//   } else if (subject) {
//     return next(new ErrorResponse("Bộ lọc môn học chỉ áp dụng cho cấp Đại học", 400));
//   }
//   if (documentType) query.documentType = documentType;
//   if (tag) query.tags = { $in: [tag] };
//   if (dateFrom)
//     query.uploadedAt = { ...query.uploadedAt, $gte: new Date(dateFrom) };
//   if (dateTo)
//     query.uploadedAt = { ...query.uploadedAt, $lte: new Date(dateTo) };

//   const documents = await Document.find(query)
//     .sort({ uploadedAt: -1 })
//     .skip((page - 1) * limit)
//     .limit(Number(limit))
//     .populate("uploadedBy", "username avatar")
//     .select(
//       "title description thumbnail educationLevel grade subject documentType downloads views uploadedAt tags"
//     );

//   const total = await Document.countDocuments(query);

//   res.status(200).json({
//     success: true,
//     data: documents || [],
//     totalPages: Math.ceil(total / limit),
//     currentPage: Number(page),
//   });
// });

exports.getPopularDocuments = asyncHandler(async (req, res, next) => {
  const { limit = 4 } = req.query;
  let query = {};

  const documents = await Document.find(query)
    .sort({ downloads: -1 })
    .limit(Number(limit))
    .populate("uploadedBy", "username avatar")
    .select("title thumbnail educationLevel documentType downloads views");

  res.status(200).json({ success: true, data: documents || [] });
});

exports.getRelatedDocuments = asyncHandler(async (req, res, next) => {
  const { educationLevel, subject, excludeId } = req.query;
  let query = {
    _id: { $ne: excludeId },
    educationLevel,
  };
  if (educationLevel === "university" && subject) {
    query.subject = subject;
  } else if (subject) {
    return next(
      new ErrorResponse("Bộ lọc môn học chỉ áp dụng cho cấp Đại học", 400)
    );
  }

  const documents = await Document.find(query)
    .sort({ views: -1 })
    .limit(4)
    .populate("uploadedBy", "username avatar")
    .select("title thumbnail educationLevel documentType downloads views");

  const aiSuggestions = documents
    .map((doc) => ({
      ...doc.toObject(),
      aiScore: Math.random() * 100,
    }))
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 3);

  res.status(200).json({ success: true, data: aiSuggestions || [] });
});

exports.downloadDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    return next(new ErrorResponse("Tài liệu không tồn tại", 404));
  }

  document.downloads += 1;
  await document.save();

  res.status(200).json({ success: true, data: { fileUrl: document.fileUrl } });
});

exports.convertDocumentFormat = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { format } = req.query;

  if (!["html", "markdown"].includes(format)) {
    return next(new ErrorResponse("Định dạng không hỗ trợ", 400));
  }

  const document = await Document.findById(id);
  if (!document) {
    return next(new ErrorResponse("Tài liệu không tồn tại", 404));
  }

  let convertedContent;
  try {
    const isDocOrDocx =
      document.fileUrl.endsWith(".doc") || document.fileUrl.endsWith(".docx");
    const isPdf = document.fileUrl.endsWith(".pdf");

    if (!isDocOrDocx && !isPdf) {
      return next(new ErrorResponse("File không hỗ trợ chuyển đổi", 400));
    }

    const fileResponse = await fetch(document.fileUrl);
    if (!fileResponse.ok) {
      throw new Error("Không thể tải file từ Cloudinary");
    }

    const tempFilePath = path.join(
      __dirname,
      `temp_${id}_${Date.now()}${isDocOrDocx ? ".docx" : ".pdf"}`
    );
    const fileBuffer = await fileResponse.buffer();
    await fs.writeFile(tempFilePath, fileBuffer);

    if (isDocOrDocx) {
      const result = await mammoth.convertToHtml({ path: tempFilePath });
      convertedContent = result.value;

      if (format === "markdown") {
        const turndownService = new TurndownService();
        convertedContent = turndownService.turndown(convertedContent);
      }
    } else if (isPdf) {
      return next(
        new ErrorResponse("Chuyển đổi từ PDF hiện chưa được hỗ trợ", 400)
      );
    }

    await fs.unlink(tempFilePath);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.title}.${format}"`
    );
    res.setHeader(
      "Content-Type",
      format === "html" ? "text/html" : "text/markdown"
    );
    res.send(convertedContent);
  } catch (err) {
    console.error("Conversion error:", err);
    return next(
      new ErrorResponse(`Lỗi khi chuyển đổi định dạng: ${err.message}`, 500)
    );
  }
});
