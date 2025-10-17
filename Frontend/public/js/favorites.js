document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("favorites-container");

  try {
    const res = await fetch("/api/favorites", { credentials: "include" });
    if (res.status === 401) {
      alert("กรุณาเข้าสู่ระบบก่อน");
      window.location.href = "/login";
      return;
    }

    const favorites = await res.json();
    console.log("❤️ favorites:", favorites);

    if (!favorites.length) {
      container.innerHTML = "<p style='text-align:center;'>ยังไม่มีสินค้าที่ถูกใจ</p>";
      return;
    }

    // ✅ ใช้ layout แบบเดียวกับหน้า Home
    container.innerHTML = favorites.map(fav => {
      const p = fav.product;
      const imgUrl = p.images?.[0]?.image_url || "/images/no-image.png";
      const price = p.prices?.[0];

      return `
        <div class="pro">
          <a href="/api/products/${p.product_id}">
            <img src="${imgUrl}" alt="${p.product_name}">
          </a>

          <div class="des">
            <span>${p.story_name || "ไม่มีชื่อเรื่อง"}</span>
            <h5>${p.product_name}</h5>
            ${price ? `<h4>${price.price_test}฿ / ${price.price_pri}฿</h4>` : ""}
          </div>

          <div class="btn-pro">
            <i class='bx bxs-heart fav-remove btn' data-id="${p.product_id}" style="color: crimson;"></i>
            <a href="#" class="btn-add-cart" data-id="${p.product_id}">
              <i class="bx bx-cart btn"></i>
            </a>
          </div>
        </div>
      `;
    }).join("");

    document.querySelectorAll(".fav-remove").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const productId = e.currentTarget.dataset.id;

        const res = await fetch("/api/favorites/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId })
        });

        const data = await res.json();

        if (res.ok) {
          // ✅ toggle สีหัวใจทันที
          if (data.liked) {
            e.currentTarget.classList.add("bxs-heart");
            e.currentTarget.classList.remove("bx-heart");
            e.currentTarget.style.color = "crimson";
          } else {
            e.currentTarget.classList.add("bx-heart");
            e.currentTarget.classList.remove("bxs-heart");
            e.currentTarget.style.color = "";

            // ✅ ถ้าเป็นหน้า favorites ให้ลบการ์ดออกไปเลยเมื่อยกเลิกถูกใจ
            e.currentTarget.closest(".pro").remove();
            if (!document.querySelector(".pro")) {
              container.innerHTML = "<p style='text-align:center;'>ยังไม่มีสินค้าที่ถูกใจ</p>";
            }
          }
        } else {
          alert(data.message || "เกิดข้อผิดพลาด");
        }
      });
    });

  } catch (err) {
    console.error("❌ โหลดรายการถูกใจล้มเหลว:", err);
    container.innerHTML = "<p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>";
  }
});
