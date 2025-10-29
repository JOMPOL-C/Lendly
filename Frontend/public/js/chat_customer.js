const socket = io("http://localhost:8000");

let currentChatId = localStorage.getItem("chat_id") || null;
let customerId = null;
let customerName = null;

const form = document.getElementById("chat-form");
const input = document.getElementById("message");
const messages = document.getElementById("messages");

// ============================
// 🚀 โหลดข้อมูลผู้ใช้
// ============================
(async function init() {
  try {
    const res = await fetch("/api/me");
    if (!res.ok) throw new Error("ยังไม่ได้ล็อกอิน");

    const user = await res.json();
    customerId = user.customer_id;
    customerName = user.username;

    localStorage.setItem("customer_id", customerId);
    localStorage.setItem("customer_name", customerName);

    await initChat();
  } catch (err) {
    console.warn("⚠️ ยังไม่ได้ login:", err.message);
  }
})();

// ============================
// 📦 โหลดห้องหรือสร้างใหม่
// ============================
async function initChat() {
  try {
    const check = await fetch(`/api/chats?customerId=${customerId}`);
    const exists = await check.json();

    if (exists.length > 0) {
      currentChatId = exists[0].chat_id;
      console.log("🟢 ใช้ห้องเดิม:", currentChatId);
    } else {
      console.log("🆕 ไม่มีห้อง สร้างใหม่...");
      const newChat = await createNewChat(customerId, customerName);
      currentChatId = newChat.chat_id;
      console.log("✅ สร้างห้องใหม่สำเร็จ:", currentChatId);
    }

    localStorage.setItem("chat_id", currentChatId);
    socket.emit("joinRoom", currentChatId); // ✅ ไม่ต้องมี prefix chat_
    console.log("🏠 Joined room:", currentChatId);
    await loadMessages(currentChatId);
  } catch (err) {
    console.error("❌ โหลดห้องไม่สำเร็จ:", err);
  }
}

// ============================
// 🧱 สร้างห้องใหม่
// ============================
async function createNewChat(customerId, customerName) {
  const res = await fetch("/api/chats/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chatId: null,
      senderRole: "CUSTOMER",
      message: "เริ่มต้นสนทนาใหม่",
      customerId,
      customerName,
    }),
  });

  const data = await res.json();
  return { chat_id: data.chatId };
}

// ============================
// 📜 โหลดข้อความเก่า
// ============================
async function loadMessages(chatId) {
  const res = await fetch(`/api/chats/${chatId}/messages`);
  const msgs = await res.json();

  messages.innerHTML = "";
  msgs.forEach((m) =>
    appendMessage(m.message, m.senderRole === "CUSTOMER" ? "me" : "admin")
  );
  messages.scrollTop = messages.scrollHeight;
}

// ============================
// ✉️ ส่งข้อความ (พร้อม realtime)
// ============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!input.value.trim()) return;

  const message = input.value.trim();

  try {
    // ✅ ensure joined room
    socket.emit("joinRoom", currentChatId);

    const res = await fetch("/api/chats/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: currentChatId,
        senderRole: "CUSTOMER",
        message,
      }),
    });

    appendMessage(message, "me");
    input.value = "";
  } catch (err) {
    console.error("❌ ส่งข้อความไม่สำเร็จ:", err);
  }
});

// ============================
// 💬 รับข้อความแบบ realtime
// ============================
socket.on("receiveMessage", (msg) => {
  console.log("📨 receiveMessage:", msg);

  // ✅ ฟังเฉพาะห้องเดียวกัน และไม่ใช่ข้อความของตัวเอง
  if (msg.chatId == currentChatId && msg.senderRole !== "CUSTOMER") {
    appendMessage(msg.message, "admin");
  }
});

// ============================
// 🧱 แสดงข้อความใน DOM
// ============================
function appendMessage(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
