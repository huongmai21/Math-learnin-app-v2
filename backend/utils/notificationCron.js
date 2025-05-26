const cron = require("node-cron");
const Notification = require("../models/Notification");
const Exam = require("../models/Exam");

cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const exams = await Exam.find({
      startTime: { $gte: now, $lte: oneHourLater },
    });

    for (const exam of exams) {
      const notifications = await Notification.find({
        relatedModel: "Exam",
        relatedId: exam._id,
        type: "new_exam",
        isRead: false,
        isDeleted: false,
      }).populate("recipient");

      for (const notif of notifications) {
        global.io.to(notif.recipient._id).emit("newNotifications", {
          ...notif.toObject(),
          message: `Bài thi ${exam.title} sắp bắt đầu!`,
        });
        notif.isRead = true;
        await notif.save();
      }
    }
  } catch (error) {
    console.error("Lỗi cron notification:", error);
  }
});