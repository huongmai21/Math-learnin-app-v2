// config/mongo.js
const mongoose = require("mongoose");

const connectMongoDB = async () => {
  try {
    console.log("Đang kết nối đến MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`Kết nối MongoDB thành công: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Lỗi kết nối MongoDB: ${error.message}`);
    console.error("Chi tiết lỗi:", error);
    process.exit(1);
  }
};

module.exports = connectMongoDB;
