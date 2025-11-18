const express = require("express");
const router = express.Router();
const { requireAdmin, requireCustomer } = require("../middlewares/roleMiddleware");
const chatController = require("../Controllers/chatController");

// 🧑‍💬 ลูกค้าทั่วไป
router.get("/chats", requireCustomer, chatController.getChats);
router.get("/chats/:chatId/messages", requireCustomer, chatController.getMessages);

// ✉️ ส่งข้อความ และสร้างห้อง (ลูกค้าเท่านั้น)
router.post("/chats/send", requireCustomer, chatController.sendMessage);
router.post("/chats/create", requireCustomer, chatController.createChat);

// 🧑‍💼 แอดมินดูทุกห้องและอ่านข้อความ
router.get("/admin/chats", requireAdmin, chatController.getChats);
router.get("/admin/chats/:chatId/messages", requireAdmin, chatController.getMessages);

module.exports = router;
