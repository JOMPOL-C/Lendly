const express = require("express");
const router = express.Router();
const { requireUser, requireAdmin } = require("../middlewares/roleMiddleware");
const chatController = require("../Controllers/chatController");

// 🧑‍💬 ผู้ใช้ทั่วไป
router.get("/chats", requireUser, chatController.getChats);
router.get("/chats/:chatId/messages", requireUser, chatController.getMessages);
router.post("/chats/send", requireUser, chatController.sendMessage);

// 🧑‍💼 แอดมินดูทุกห้อง
router.get("/admin/chats", requireAdmin, chatController.getChats);
router.get("/admin/chats/:chatId/messages", requireAdmin, chatController.getMessages);

module.exports = router;
