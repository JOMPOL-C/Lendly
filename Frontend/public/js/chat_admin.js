const socket = io("http://localhost:8000");
const chatRooms = document.getElementById("chat-rooms");
const messages = document.getElementById("messages");
const chatTitle = document.getElementById("chat-title");
const form = document.getElementById("chat-form");
const input = document.getElementById("message");
let currentRoom = null;

// ============================
// 📦 โหลดห้องทั้งหมด
// ============================
async function loadChats() {
  try {
    const res = await fetch("/api/admin/chats");
    const chats = await res.json();

    chatRooms.innerHTML = chats.length
      ? chats.map((c) => `
          <div class="chat-item" data-room="${c.chat_id}">
            <div class="chat-name">${c.customerName}</div>
            <div class="chat-last">${c.lastMessage || "ยังไม่มีข้อความ"}</div>
          </div>
        `).join("")
      : `<p class="empty">ไม่มีห้องแชท</p>`;

    document.querySelectorAll(".chat-item").forEach((item) => {
      item.addEventListener("click", () => {
        currentRoom = item.dataset.room;
        socket.emit("joinRoom", currentRoom); // ✅ ไม่มี chat_ prefix แล้ว
        console.log("🏠 Joined room:", currentRoom);

        chatTitle.textContent =
          "ห้อง: " + item.querySelector(".chat-name").textContent;
        loadMessages(currentRoom);

        document
          .querySelectorAll(".chat-item")
          .forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
      });
    });
  } catch (err) {
    console.error("❌ โหลดห้องไม่สำเร็จ:", err);
  }
}

// ============================
// 📜 โหลดข้อความเก่า
// ============================
async function loadMessages(roomId) {
  const res = await fetch(`/api/admin/chats/${roomId}/messages`);
  const msgs = await res.json();

  messages.innerHTML = "";
  msgs.forEach((m) =>
    appendMessage(m.message, m.senderRole === "ADMIN" ? "me" : "customer")
  );
  messages.scrollTop = messages.scrollHeight;
}

// ============================
// ✉️ ส่งข้อความ realtime
// ============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!input.value.trim() || !currentRoom) return;

  const message = input.value.trim();

  try {
    // ✅ ensure joined room ก่อนส่ง
    socket.emit("joinRoom", currentRoom);

    const res = await fetch("/api/chats/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: currentRoom,
        senderRole: "ADMIN",
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
// 💬 รับข้อความ realtime จากลูกค้า
// ============================
socket.on("receiveMessage", (msg) => {
  console.log("📨 receiveMessage:", msg);

  // ✅ ถ้าอยู่ในห้องเดียวกัน ให้ append ข้อความทันที
  if (msg.chatId == currentRoom && msg.senderRole !== "ADMIN") {
    appendMessage(msg.message, "customer");
  }

  // ✅ อัปเดตข้อความล่าสุดใน sidebar
  const chatItem = document.querySelector(`.chat-item[data-room="${msg.chatId}"]`);
  if (chatItem) {
    chatItem.querySelector(".chat-last").textContent = msg.message;
    if (msg.chatId != currentRoom) chatItem.classList.add("unread");
  } else {
    // ถ้าเป็นห้องใหม่ (ลูกค้าเพิ่งเริ่มคุย)
    const newItem = document.createElement("div");
    newItem.className = "chat-item unread";
    newItem.dataset.room = msg.chatId;
    newItem.innerHTML = `
      <div class="chat-name">${msg.customerName || "ลูกค้าใหม่"}</div>
      <div class="chat-last">${msg.message}</div>
    `;
    newItem.addEventListener("click", () => {
      currentRoom = msg.chatId;
      socket.emit("joinRoom", currentRoom);
      chatTitle.textContent = "ห้อง: " + (msg.customerName || "ลูกค้าใหม่");
      loadMessages(currentRoom);
      document.querySelectorAll(".chat-item").forEach(i => i.classList.remove("active"));
      newItem.classList.add("active");
    });
    chatRooms.prepend(newItem);

    const audio = new Audio("/sounds/notification.mp3");
    audio.play().catch(() => {});
  }
});

// ============================
// 🆕 ฟัง event newChat (ลูกค้าเปิดห้องใหม่)
// ============================
socket.on("newChat", (data) => {
  console.log("🆕 ห้องใหม่จากลูกค้า:", data);
  const newItem = document.createElement("div");
  newItem.className = "chat-item unread";
  newItem.dataset.room = data.chatId;
  newItem.innerHTML = `
    <div class="chat-name">${data.customerName}</div>
    <div class="chat-last">${data.lastMessage}</div>
  `;
  newItem.addEventListener("click", () => {
    currentRoom = data.chatId;
    socket.emit("joinRoom", currentRoom);
    chatTitle.textContent = "ห้อง: " + data.customerName;
    loadMessages(currentRoom);
    document.querySelectorAll(".chat-item").forEach(i => i.classList.remove("active"));
    newItem.classList.add("active");
  });
  chatRooms.prepend(newItem);


  audio.play().catch(() => {});
});

// ============================
// 🧱 ฟังก์ชันแสดงข้อความใน DOM
// ============================
function appendMessage(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerHTML = `<span>${text}</span>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

loadChats();
