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

    console.log("💬 [sendMessage]", { chatId, senderRole, message, customerId });

    if (!customerId || isNaN(customerId)) {
      console.warn("⚠️ [sendMessage] customerId ว่างหรือไม่ถูกต้อง");
      return res.status(400).json({ message: "ไม่พบรหัสลูกค้า" });
    }

    let chat = null;
    let isNewChat = false;

    // ✅ ถ้ามี chatId → หาจากฐาน
    if (chatId) {
      chat = await prisma.chat.findUnique({
        where: { chat_id: Number(chatId) },
      });

      if (!chat) {
        console.warn(`⚠️ ไม่พบ chat_id=${chatId}, หาจาก customerId`);
        chat = await prisma.chat.findFirst({ where: { customerId } });
      }
    }

    // ✅ ถ้ายังไม่เจออีก → สร้างห้องใหม่
    if (!chat) {
      console.log(`🆕 ยังไม่มีห้อง → สร้างใหม่ให้ customerId=${customerId}`);
      chat = await prisma.chat.create({
        data: { customerId, customerName },
      });
      isNewChat = true;
    }

    console.log(`📂 ใช้ห้อง chat_id=${chat.chat_id}`);

    // ✅ บันทึกข้อความ
    const newMsg = await prisma.message.create({
      data: {
        chatId: chat.chat_id,
        senderRole,
        message,
      },
    });

    // ✅ อัปเดตข้อความล่าสุดของห้อง
    await prisma.chat.update({
      where: { chat_id: chat.chat_id },
      data: { lastMessage: message, updatedAt: new Date() },
    });

    // ✅ เตรียมข้อมูล broadcast
    const roomId = `chat_${chat.chat_id}`;
    const broadcastData = {
      roomId,
      chatId: chat.chat_id,
      senderRole,
      message,
      createdAt: newMsg.createdAt,
      customerName: chat.customerName, // ✅ ชื่อผู้ใช้
    };

    // ✅ ตอบกลับไปยัง client ที่ส่ง
    res.json({
      chatId: chat.chat_id,
      roomId,
      message: newMsg,
    });

    // ✅ broadcast realtime ไปยังห้องนั้น (ลูกค้า + แอดมิน)
    io.to(roomId).emit("receiveMessage", broadcastData);
    console.log(`📡 [Realtime] ส่งข้อความไปยังห้อง ${roomId}`);

    // ✅ แจ้งเตือนแอดมินเมื่อมีห้องใหม่ (ครั้งแรกของลูกค้า)
    if (isNewChat) {
      io.emit("newChat", {
        chatId: chat.chat_id,
        customerName: chat.customerName,
        lastMessage: message,
      });
      console.log(`🆕 [Realtime] แจ้งแอดมินว่ามีห้องใหม่จาก ${chat.customerName}`);
    }
  } catch (err) {
    console.error("❌ [sendMessage] error:", err);
    res.status(500).json({ message: "ส่งข้อความไม่สำเร็จ" });
  }
};
