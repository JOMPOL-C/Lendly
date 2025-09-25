// JavaScript for toggle menu
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}
// active link highlighting
const currentPage = window.location.pathname.split("/").pop(); 
const fullPath = window.location.pathname; // เก็บ path เต็ม
const links = document.querySelectorAll("#navbar li a");

links.forEach(link => {
  const href = link.getAttribute("href");

  if (
    href === currentPage || 
    (href === "/" && currentPage === "") || 
    (href.includes("category") && fullPath.includes("category"))
  ) {
    link.classList.add("active");
  }
});