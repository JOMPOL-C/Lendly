document.addEventListener("DOMContentLoaded", () => {
    const popup = document.getElementById("refund-popup");
    const cancelBtn = document.getElementById("cancel-refund");
    const refundForm = document.getElementById("refundForm");

    document.querySelectorAll(".refund-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            popup.style.display = "flex";
            document.getElementById("refund-rental-id").value = btn.dataset.rentalId;
            document.getElementById("refund-amount").value = btn.dataset.amount;
        });
    });

    cancelBtn.addEventListener("click", () => {
        popup.style.display = "none";
    });

    refundForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(refundForm);
        try {
            const res = await fetch(`/api/refund/${formData.get("rental_id")}`, {
                method: "POST",
                body: formData
            });
            const result = await res.json();
            if (res.ok) {
                alert("✅ คืนมัดจำสำเร็จ!");
                popup.style.display = "none";
                location.reload();
            } else {
                alert("❌ เกิดข้อผิดพลาด: " + result.error);
            }
        } catch (err) {
            console.error(err);
            alert("❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        }
    });
});
