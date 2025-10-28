const db = require("../utils/firebase");

exports.sendMessage = async (req, res) => {
  const { content } = req.body;
  const sender = req.user.role === "ADMIN" ? "ADMIN" : "CUSTOMER";
  const customerId = sender === "CUSTOMER" ? req.user.customer_id : req.body.customerId;

  const chatRef = db.collection("chats").doc(String(customerId));
  const messageRef = chatRef.collection("messages").doc();

  await messageRef.set({
    sender,
    content,
    sentAt: new Date(),
  });

  await chatRef.set({
    lastMessage: content,
    updatedAt: new Date(),
    customerName: req.user.name,
  }, { merge: true });

  res.json({ message: "sent" });
};
