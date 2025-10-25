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
  };