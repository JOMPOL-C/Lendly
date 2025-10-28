// ======== 📱 Toggle menu (mobile) ========
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
  bar.addEventListener('click', () => nav.classList.add('active'));
}

if (close) {
  close.addEventListener('click', () => nav.classList.remove('active'));
}

// ปิดเมนูเมื่อคลิก link บนมือถือ
document.querySelectorAll('#navbar a').forEach(a => {
  a.addEventListener('click', () => nav.classList.remove('active'));
});

// ======== 🌈 Active link highlighting ========
const currentPath = window.location.pathname;
const links = document.querySelectorAll("#navbar li a");

links.forEach(link => {
  const href = link.getAttribute("href");

  // เช็คเฉพาะ path ที่ตรงกันเป๊ะ หรือกรณี /home /category แบบตรงเท่านั้น
  if (currentPath === href || (href !== "/" && currentPath.startsWith(href + "/"))) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});

// ======== 👤 User dropdown toggle ========
document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.querySelector('#lg-user');
  if (!dropdown) return;

  const icon = dropdown.querySelector('.user-icon');
  icon.addEventListener('click', (e) => {
    e.preventDefault();
    dropdown.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove('active');
  });
});

  function showTooltip(message, type = "info") {
  const colors = {
    success: "#6d28d9",
  warning: "#fbbf24",
  error: "#ef4444",
  info: "#3b82f6",
  };

  const tooltip = document.createElement("div");
  tooltip.textContent = message;
  tooltip.style.position = "fixed";
  tooltip.style.top = "20px";
  tooltip.style.left = "50%";
  tooltip.style.transform = "translateX(-50%)";
  tooltip.style.background = colors[type] || "#6b7280";
  tooltip.style.color = "white";
  tooltip.style.padding = "12px 18px";
  tooltip.style.borderRadius = "10px";
  tooltip.style.fontWeight = "600";
  tooltip.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
  tooltip.style.zIndex = "9999";
  tooltip.style.transition = "opacity 0.4s ease";

  document.body.appendChild(tooltip);
  setTimeout(() => (tooltip.style.opacity = "0"), 1200);
  setTimeout(() => tooltip.remove(), 1600);
}
