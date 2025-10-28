const nodemailer = require("nodemailer");

// ================================
// ✉️ ตั้งค่า Gmail SMTP
// ================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================================
// 🎨 ฟังก์ชันสร้าง HTML Template
// ================================
function createEmailTemplate({ title, message, highlight, footer }) {
  return `
  <div style="font-family: 'Prompt', sans-serif; background-color:#f8f9fa; padding:40px; color:#333;">
    <div style="max-width:600px; margin:0 auto; background:white; border-radius:16px; box-shadow:0 8px 24px rgba(0,0,0,0.08); overflow:hidden;">
      <div style="background:linear-gradient(90deg, #6d28d9, #a855f7); color:white; padding:20px 30px; text-align:center;">
        <h1 style="margin:0; font-size:24px;">💜 Lendly</h1>
        <p style="margin:0; font-size:14px;">ระบบเช่าแฟชั่นออนไลน์</p>
      </div>

      <div style="padding:30px;">
        <h2 style="color:#6d28d9; font-size:20px;">${title}</h2>
        <p style="font-size:16px; line-height:1.6;">${message}</p>

        ${
          highlight
            ? `<div style="background:#f5f3ff; border-left:5px solid #6d28d9; padding:15px; border-radius:8px; margin-top:15px; font-size:15px;">
                ${highlight}
              </div>`
            : ""
        }

        <div style="margin-top:30px; text-align:center;">
          <a href="https://lendly.com" style="background:#6d28d9; color:white; padding:12px 30px; border-radius:10px; text-decoration:none; font-weight:600;">
            ไปที่เว็บไซต์ Lendly
          </a>
        </div>
      </div>

      <div style="background:#f3e8ff; padding:15px 20px; text-align:center; font-size:13px; color:#6b21a8;">
        ${footer || "ขอบคุณที่ใช้บริการ Lendly 💜"}
      </div>
    </div>
  </div>
  `;
}

// ================================
// 📤 ฟังก์ชันส่งอีเมล
// ================================
async function sendEmail({ to, subject, title, message, highlight, footer }) {
  if (!to) {
    console.warn("⚠️ ไม่มีอีเมลปลายทาง — ข้ามการแจ้งเตือน");
    return;
  }

  const html = createEmailTemplate({ title, message, highlight, footer });

  try {
    const info = await transporter.sendMail({
      from: `"Lendly แจ้งเตือน" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ ส่งอีเมลสำเร็จถึง ${to} (${subject}) | messageId=${info.messageId}`);
  } catch (err) {
    console.error("❌ ส่งอีเมลล้มเหลว:", err.message);
  }
}

// ================================
// 👤 ฟังก์ชันสำหรับลูกค้า
// ================================
exports.notifyUserEmail = async (userEmail, message, title = "📢 แจ้งเตือนจาก Lendly") => {
  await sendEmail({
    to: userEmail,
    subject: title,
    title,
    message,
    footer: "ทีมงาน Lendly ขอขอบคุณที่ไว้วางใจใช้บริการ 💜",
  });
};

// ================================
// 🧭 ฟังก์ชันสำหรับแอดมิน
// ================================
exports.notifyAdminEmail = async (message, title = "📬 แจ้งเตือนสำหรับผู้ดูแลระบบ Lendly") => {
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: title,
    title,
    message,
    highlight: "📍 โปรดตรวจสอบข้อมูลในหน้า Admin Panel ของระบบ Lendly",
  });
};
