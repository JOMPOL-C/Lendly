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
