const prisma = require("../../prisma/prisma");

// 📜 ดึงห้องแชททั้งหมด
exports.getChats = async (req, res) => {
  try {
    const { user } = req;
    console.log("👤 [getChats] req.user:", user);

    const customerId = Number(user?.customer_id || req.query.customerId);

    if (user?.role === "ADMIN") {
      const chats = await prisma.chat.findMany({
        orderBy: { updatedAt: "desc" },
      });
      return res.json(chats);
    }

    if (!customerId) {
      console.warn("⚠️ [getChats] ไม่มี customerId เลย ส่ง [] กลับ");
      return res.json([]);
    }

    const chat = await prisma.chat.findFirst({
      where: { customerId },
    });

    if (chat) {
      console.log(`✅ [getChats] พบห้องของ customerId=${customerId}:`, chat.chat_id);
      return res.json([chat]);
    } else {
      console.log(`🆕 [getChats] ยังไม่มีห้องของ customerId=${customerId}`);
      return res.json([]);
    }
  } catch (err) {
    console.error("❌ [getChats] error:", err);
    res.status(500).json({ message: "โหลดห้องไม่สำเร็จ" });
  }
};

// 📜 ดึงข้อความทั้งหมดในห้อง
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    console.log("📨 [getMessages] โหลดข้อความของห้อง:", chatId);

    const messages = await prisma.message.findMany({
      where: { chatId: parseInt(chatId) },
      orderBy: { createdAt: "asc" },
    });

    console.log(`📦 [getMessages] พบ ${messages.length} ข้อความ`);
    res.json(messages);
  } catch (err) {
    console.error("❌ [getMessages] error:", err);
    res.status(500).json({ message: "โหลดข้อความไม่สำเร็จ" });
  }
};

// 📩 ส่งข้อความ (realtime)
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, senderRole, message } = req.body;
    const user = req.user;
    const io = req.app.get("io");

    const customerId = Number(user?.customer_id || req.body.customerId);
    const customerName =
      user?.username || user?.name || req.body.customerName || "ไม่ทราบชื่อ";

    console.log("💬 [sendMessage]", { chatId, senderRole, message, customerId, role: user?.role });

    // 🚫 บล็อก ADMIN ตั้งแต่ต้น
    if (user?.role === "ADMIN" && !chatId) {
      console.warn("⛔ ADMIN พยายามเริ่มแชทใหม่ — บล็อกไว้");
      return res.status(403).json({ message: "ADMIN ไม่สามารถสร้างห้องใหม่ได้" });
    }

    // ✅ ถ้าเป็น ADMIN ให้ใช้เฉพาะ chatId ที่ระบุมาเท่านั้น
    if (user?.role === "ADMIN" && chatId) {
      const chat = await prisma.chat.findUnique({ where: { chat_id: Number(chatId) } });
      if (!chat) {
        console.warn(`⚠️ ADMIN พยายามส่งข้อความในห้อง ${chatId} แต่ไม่มีอยู่จริง`);
        return res.status(404).json({ message: "ไม่พบห้องแชท" });
      }

      const newMsg = await prisma.message.create({
        data: { chatId: chat.chat_id, senderRole, message },
      });

      io.to(`chat_${chat.chat_id}`).emit("receiveMessage", {
        roomId: `chat_${chat.chat_id}`,
        chatId: chat.chat_id,
        senderRole,
        message,
        createdAt: newMsg.createdAt,
        customerName: chat.customerName,
      });

      await prisma.chat.update({
        where: { chat_id: chat.chat_id },
        data: { lastMessage: message, updatedAt: new Date() },
      });

      return res.json({ success: true, chatId: chat.chat_id });
    }

    // ===============================
    // 🚀 จากนี้เป็นของลูกค้าปกติเท่านั้น
    // ===============================
    let chat = await prisma.chat.findFirst({ where: { customerId } });

    if (!chat) {
      console.log(`🆕 ยังไม่มีห้อง → สร้างใหม่ให้ customerId=${customerId}`);
      chat = await prisma.chat.create({
        data: { customerId, customerName },
      });
    }

    const newMsg = await prisma.message.create({
      data: { chatId: chat.chat_id, senderRole, message },
    });

    io.to(`chat_${chat.chat_id}`).emit("receiveMessage", {
      roomId: `chat_${chat.chat_id}`,
      chatId: chat.chat_id,
      senderRole,
      message,
      createdAt: newMsg.createdAt,
      customerName: chat.customerName,
    });

    res.json({ chatId: chat.chat_id });
  } catch (err) {
    console.error("❌ [sendMessage] error:", err);
    res.status(500).json({ message: "ส่งข้อความไม่สำเร็จ" });
  }
};


// 🆕 สร้างห้องเปล่า (โดยไม่ต้องส่งข้อความ)
exports.createChat = async (req, res) => {
  try {
    const user = req.user;
    const customerId = Number(user?.customer_id || req.body.customerId);
    const customerName =
      user?.username || req.body.customerName || "ไม่ทราบชื่อ";
    const io = req.app.get("io");

    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({ message: "ไม่พบรหัสลูกค้า" });
    }

    // ✅ หาห้องที่มีอยู่ก่อน
    let chat = await prisma.chat.findFirst({
      where: { customerId },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: { customerId, customerName },
      });
      console.log(`🆕 [createChat] สร้างห้องใหม่ให้ customerId=${customerId}`);
    } else {
      console.log(`🟢 [createChat] ห้องมีอยู่แล้ว chat_id=${chat.chat_id}`);
    }

    // ✅ แจ้ง admin ถ้ามีห้องใหม่
    io.emit("newChat", {
      chatId: chat.chat_id,
      customerName: chat.customerName,
      lastMessage: chat.lastMessage || "เริ่มการสนทนาใหม่",
    });

    return res.json(chat);
  } catch (err) {
    console.error("❌ [createChat] error:", err);
    res.status(500).json({ message: "สร้างห้องไม่สำเร็จ" });
  }
};
