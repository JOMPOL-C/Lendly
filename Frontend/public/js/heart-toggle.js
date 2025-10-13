document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".bx-heart, .bxs-heart").forEach(btn => {
        if (btn.closest(".nav-fav-link")) return; // ข้ามถ้าเป็นปุ่มใน navbar        
      btn.addEventListener("click", async e => {
        e.preventDefault();
        const productId = e.currentTarget.dataset.id;
        const res = await fetch("/api/favorites/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId })
        });
        console.log("❤️ Sending favorite:", productId);
        const data = await res.json();
  
        if (res.ok) {
          if (data.liked) {
            e.currentTarget.classList.add("bxs-heart");
            e.currentTarget.classList.remove("bx-heart");
            e.currentTarget.style.color = "crimson";
          } else {
            e.currentTarget.classList.add("bx-heart");
            e.currentTarget.classList.remove("bxs-heart");
            e.currentTarget.style.color = "";
          }
        } else if (res.status === 401) {
          alert("กรุณาเข้าสู่ระบบก่อน");
          window.location.href = "/login";
        }
      });
    });
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".bx-heart, .bxs-heart").forEach(btn => {
      // ถ้าไม่มี data-id แปลว่าไม่ใช่หัวใจของสินค้า (เช่น navbar) → ข้าม
      if (!btn.dataset.id) return;
  
      btn.addEventListener("click", async e => {
        e.preventDefault();
        const productId = e.currentTarget.dataset.id;
  
        // 🔹 เปลี่ยนสีทันทีแบบ optimistic update
        const isLiked = e.currentTarget.classList.contains("bxs-heart");
        if (isLiked) {
          e.currentTarget.classList.remove("bxs-heart");
          e.currentTarget.classList.add("bx-heart");
          e.currentTarget.style.color = ""; // กลับเป็นสีปกติ
        } else {
          e.currentTarget.classList.remove("bx-heart");
          e.currentTarget.classList.add("bxs-heart");
          e.currentTarget.style.color = "crimson"; // สีแดงตอนถูกใจ
        }
  
        // 🔹 ส่งข้อมูลไป backend
        const res = await fetch("/api/favorites/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId })
        });
  
        const data = await res.json();
  
        // 🔹 ถ้า backend ล้มเหลว → กลับสถานะเดิม
        if (!res.ok) {
          alert(data.message || "เกิดข้อผิดพลาด");
          // revert icon
          e.currentTarget.classList.toggle("bx-heart");
          e.currentTarget.classList.toggle("bxs-heart");
          e.currentTarget.style.color = isLiked ? "crimson" : "";
        }
      });
    });
  });
  