const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// Giả định sử dụng một service AI (ví dụ: OpenAI hoặc custom logic)
exports.askMathQuestion = asyncHandler(async (req, res, next) => {
  const { question } = req.body;

  if (!question) {
    return next(new ErrorResponse("Câu hỏi không được để trống", 400));
  }

  // Logic giả định gọi API AI (cần tích hợp thực tế)
  const answer = await someMathSolverService(question); // Thay bằng API thực tế

  res.status(200).json({
    success: true,
    answer,
  });
});