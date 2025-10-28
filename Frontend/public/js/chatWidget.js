import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// ===============================
// 🔥 Firebase Config
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyAeBRXnxHUKXUKcm2r_DSfzvBHXuOuWhaQ",
  authDomain: "lendly-5ee70.firebaseapp.com",
  projectId: "lendly-5ee70",
  storageBucket: "lendly-5ee70.firebasestorage.app",
  messagingSenderId: "831943468595",
  appId: "1:831943468595:web:846bf587df4b1b7065e546",
  measurementId: "G-RCPEEFTNTW",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// 👤 กำหนดรหัสลูกค้า
// ===============================
const customerId =
  localStorage.getItem("customer_id") || "guest_" + Date.now();
const customerName =
  localStorage.getItem("customer_name") || "ผู้ใช้ใหม่";

// ===============================
// 🏠 สร้างห้องแชท (ถ้ายังไม่มี)
// ===============================
async function ensureChatRoom() {
  const chatRef = doc(db, "chats", customerId);
  const docSnap = await getDoc(chatRef);

  if (!docSnap.exists()) {
    await setDoc(chatRef, {
      customerId,
      customerName,
      lastMessage: "",
      updatedAt: new Date(),
    });
    console.log("✅ สร้างห้องแชทใหม่ให้ลูกค้า:", customerId);
  }
}
ensureChatRoom();

// ===============================
// 🎨 DOM Elements
// ===============================
const chatToggle = document.getElementById("chat-toggle");
const chatBox = document.getElementById("chat-box");
const closeBtn = document.getElementById("chat-close");
const msgBox = document.getElementById("chat-messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");

// ===============================
// 🔴 จุดแดงแจ้งเตือน
// ===============================
const notifDot = document.createElement("span");
Object.assign(notifDot.style, {
  position: "absolute",
  top: "-5px",
  right: "-5px",
  width: "12px",
  height: "12px",
  background: "#ef4444",
  borderRadius: "50%",
  display: "none",
  border: "2px solid white",
  boxShadow: "0 0 5px rgba(0,0,0,0.3)",
});
chatToggle.style.position = "relative";
chatToggle.appendChild(notifDot);

// 🔔 เสียงแจ้งเตือน
const notifSound = new Audio("/sounds/notification.mp3");
notifSound.volume = 0.4;

// ===============================
// 📦 เปิด/ปิดกล่องแชท
// ===============================
chatToggle.onclick = () => {
  const isActive = chatBox.classList.toggle("active");
  notifDot.style.display = "none";
  chatToggle.classList.remove("bounce");

  if (!isActive) {
    setTimeout(() => (chatBox.style.display = "none"), 250);
  } else {
    chatBox.style.display = "flex";
    requestAnimationFrame(() => chatBox.classList.add("active"));
  }
};

closeBtn.onclick = () => {
  chatBox.classList.remove("active");
  setTimeout(() => (chatBox.style.display = "none"), 250);
};

// ===============================
// 💬 ฟังข้อความแบบเรียลไทม์
// ===============================
const q = query(
  collection(db, `chats/${customerId}/messages`),
  orderBy("createdAt", "asc")
);

onSnapshot(q, (snapshot) => {
  msgBox.innerHTML = "";
  let hasUnread = false;

  snapshot.forEach((doc) => {
    const m = doc.data();
    const div = document.createElement("div");
    div.className =
      "msg " + (m.senderRole === "CUSTOMER" ? "me" : "admin");
    div.innerHTML = `
      <div>${m.message}</div>
      <small style="color:#888;">${m.createdAt
        ? new Date(m.createdAt.toDate?.() || m.createdAt).toLocaleTimeString(
            "th-TH",
            { hour: "2-digit", minute: "2-digit" }
          )
        : ""}</small>
    `;
    msgBox.appendChild(div);

    if (m.senderRole === "ADMIN" && !chatBox.classList.contains("active")) {
      hasUnread = true;
    }
  });

  msgBox.scrollTop = msgBox.scrollHeight;

  if (hasUnread) {
    notifDot.style.display = "block";
    notifSound.currentTime = 0;
    notifSound.play().catch(() => {});
    chatToggle.classList.add("bounce");
    setTimeout(() => chatToggle.classList.remove("bounce"), 600);
  }
});

// ===============================
// ✉️ ส่งข้อความ
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!input.value.trim()) return;

  const messageText = input.value.trim();

  await addDoc(collection(db, `chats/${customerId}/messages`), {
    senderId: customerId,
    senderRole: "CUSTOMER",
    message: messageText,
    createdAt: new Date(),
  });

  await updateDoc(doc(db, "chats", customerId), {
    lastMessage: messageText,
    updatedAt: new Date(),
  });

  input.value = "";
});
