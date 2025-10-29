const socket = io("http://localhost:8000");

let currentChatId = null;
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

    console.log(`👤 เข้าสู่ระบบในชื่อ: ${customerName} (ID ${customerId})`);

    await initChat();
  } catch (err) {
    console.warn("⚠️ ยังไม่ได้ login:", err.message);
  }
})();

// ============================
// 📦 โหลดห้องจากฐาน หรือสร้างใหม่
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
      currentChatId = data.chatId;
      console.log("✅ สร้างห้องใหม่สำเร็จ:", currentChatId);
    }

    // ✅ join ห้องตามฐาน
    socket.emit("joinRoom", currentChatId);
    console.log("🏠 Joined room:", currentChatId);

    await loadMessages(currentChatId);
  } catch (err) {
    console.error("❌ โหลดห้องไม่สำเร็จ:", err);
  }
}

// ============================
// 📜 โหลดข้อความเก่าจากฐาน
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
// ✉️ ส่งข้อความ (Realtime)
// ============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!input.value.trim()) return;

  const message = input.value.trim();

  try {
    // ✅ ensure join ก่อนส่ง
    socket.emit("joinRoom", currentChatId);

    await fetch("/api/chats/send", {
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
