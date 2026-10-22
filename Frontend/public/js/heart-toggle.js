async function toggleFavorite(event) {
  event.preventDefault();

  const heartButton = event.currentTarget;
  const productId = heartButton.dataset.id;
  if (!productId) return;

  const wasLiked = heartButton.classList.contains("bxs-heart");

  heartButton.classList.toggle("bx-heart", wasLiked);
  heartButton.classList.toggle("bxs-heart", !wasLiked);
  heartButton.style.color = wasLiked ? "" : "crimson";

  try {
    const response = await fetch("/api/favorites/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId }),
    });

    const data = await response.json();

    if (response.status === 401) {
      alert("กรุณาเข้าสู่ระบบก่อน");
      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      throw new Error(data.message || "เกิดข้อผิดพลาด");
    }

    heartButton.classList.toggle("bx-heart", !data.liked);
    heartButton.classList.toggle("bxs-heart", data.liked);
    heartButton.style.color = data.liked ? "crimson" : "";
  } catch (error) {
    alert(error.message || "เกิดข้อผิดพลาด");
    heartButton.classList.toggle("bx-heart", !wasLiked);
    heartButton.classList.toggle("bxs-heart", wasLiked);
    heartButton.style.color = wasLiked ? "crimson" : "";
  }
}

window.bindFavoriteButtons = (root = document) => {
  root.querySelectorAll(".bx-heart[data-id], .bxs-heart[data-id]").forEach((button) => {
    if (button.dataset.favoriteBound === "true") return;
    button.dataset.favoriteBound = "true";
    button.addEventListener("click", toggleFavorite);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  window.bindFavoriteButtons();
});
