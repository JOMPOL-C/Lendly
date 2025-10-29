const db = require("../utils/firebase");

// 📩 ดึงแชททั้งหมดของผู้ใช้ (ลูกค้าหรือแอดมิน)
exports.getChats = async (req, res) => {
  try {
    const { userId } = req.user; // ดึงจาก token
    const chatsRef = db.collection("chats");

    // 🔹 ถ้าเป็นแอดมิน → เห็นทุกแชท
    if (req.user.role === "ADMIN") {
      const snapshot = await chatsRef.get();
      const allChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json(allChats);
    }

    // 🔹 ถ้าเป็น user → เห็นเฉพาะของตัวเอง
    const snapshot = await chatsRef.where("customerId", "==", userId).get();
    const myChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(myChats);
  } catch (err) {
    console.error("❌ getChats error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการโหลดแชท" });
  }
};

exports.getMessages = async (req, res) => {
    try {
      const { chatId } = req.params;
      const snapshot = await db
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .orderBy("createdAt", "asc")
        .get();
  
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(messages);
    } catch (err) {
      console.error("❌ getMessages error:", err);
      res.status(500).json({ message: "โหลดประวัติแชทไม่สำเร็จ" });
    }
  };

// 📤 ส่งข้อความใหม่
exports.sendMessage = async (req, res) => {
<<<<<<< HEAD
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

    let isNewChat = false;

    // ✅ ถ้ามี chatId → หาจากฐาน
    // ✅ หาโดย customerId เป็นหลักเลย
    let chat = await prisma.chat.findUnique({
      where: { customerId }, // ใช้คอลัมน์ unique โดยตรง
    });

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
=======
    try {
      const { chatId, message } = req.body;
      const { user } = req;
  
      if (!message) {
        return res.status(400).json({ message: "ต้องกรอกข้อความ" });
      }
  
      let chatDocId = chatId;
  
      // 🧩 ถ้ายังไม่มีห้อง (ไม่มี chatId) → สร้างใหม่
      if (!chatDocId) {
        const newChat = await db.collection("chats").add({
          customerId: user.customer_id,
          customerName: user.name, // ✅ เพิ่มชื่อผู้ใช้
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessage: message,
        });
        chatDocId = newChat.id;
      }
  
      const msgData = {
        senderId: user.customer_id,
        senderRole: user.role,
>>>>>>> parent of af666b8 (Chat Realtime)
        message,
        createdAt: new Date(),
      };
  
      // 📨 บันทึกข้อความใน subcollection messages
      await db
        .collection("chats")
        .doc(chatDocId)
        .collection("messages")
        .add(msgData);
  
      // 🔁 อัปเดตข้อความล่าสุดในห้องหลัก
      await db.collection("chats").doc(chatDocId).set(
        {
          lastMessage: message,
          updatedAt: new Date(),
        },
        { merge: true }
      );
  
      res.json({ message: "ส่งข้อความสำเร็จ", chatId: chatDocId, data: msgData });
    } catch (err) {
      console.error("❌ sendMessage error:", err);
      res.status(500).json({ message: "ไม่สามารถส่งข้อความได้" });
    }
<<<<<<< HEAD
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
    let chat = await prisma.chat.findUnique({ where: { customerId } });
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
=======
  };
>>>>>>> parent of af666b8 (Chat Realtime)
