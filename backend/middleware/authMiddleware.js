// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

const authenticateToken = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.replace("Bearer ", "");
      if (!token) {
        return next(
          new ErrorResponse("Không có token, vui lòng đăng nhập!", 401)
        );
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(new ErrorResponse("Người dùng không tồn tại!", 401));
      }

      req.user = user;
      console.log(`Authenticated user: ${decoded.id}`);
      next();
    } catch (err) {
      console.error("Token verification error:", {
        message: err.message,
        name: err.name,
        token: req.headers.authorization?.substring(0, 10) + "...",
      });
      if (err.name === "TokenExpiredError") {
        return next(
          new ErrorResponse("Token đã hết hạn, vui lòng đăng nhập lại!", 401)
        );
      }
      return next(new ErrorResponse("Token không hợp lệ!", 401));
    }
  } else {
    return next(new ErrorResponse("Không có token, vui lòng đăng nhập!", 401));
  }
};

const checkRole = (...roles) => {
  return (req, res, next) => {
    console.log("Current user role:", req.user.role);
    console.log("Allowed roles:", roles);
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ErrorResponse("Không có quyền truy cập.", 403));
    }
    next();
  };
};



module.exports = { authenticateToken, checkRole };
