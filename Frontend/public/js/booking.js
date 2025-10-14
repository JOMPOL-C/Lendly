// ============================
// 📅 booking.js – สำหรับ Detail_Pro.ejs
// ============================

// โหมดเริ่มต้น
let mode = "test";

// 🎚 เปลี่ยนโหมด (เทส / ไพร)
document.querySelectorAll("input[name=mode]").forEach(radio => {
  radio.addEventListener("change", e => {
    mode = e.target.value;
  });
});

// ============================
// 📦 โหลดข้อมูลการจองจาก backend
// ============================

async function loadBookings(productId) {
  try {
    const res = await fetch(`/api/rentals/product/${productId}`);
    if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลการจองได้");
    const data = await res.json();

    // ✅ ใช้ key ใหม่จาก backend
    const bookings = data.map(b => ({
      start: b.start,
      end: b.end,
    }));

    setupCalendar(bookings);
  } catch (err) {
    console.error("❌ loadBookings error:", err);
    setupCalendar([]); // fallback ถ้าโหลดไม่ได้
  }
}


// ============================
// 🧮 คำนวณช่วงวัน disable สำหรับ Flatpickr
// ============================

function computeDisabledRanges(bookings) {
  return bookings.map(b => {
    let start = new Date(b.start);
    let end = new Date(b.end);

    // กัน 3 วันก่อนวันเช่า
    let startMinus3 = new Date(start);
    startMinus3.setDate(start.getDate() - 3);

    // กัน 9 วันหลังวันคืน (ซัก/ส่งต่อ)
    let endPlus9 = new Date(end);
    endPlus9.setDate(end.getDate() + 9);

    return {
      from: startMinus3.toISOString().split("T")[0],
      to: endPlus9.toISOString().split("T")[0],
    };
  });
}

// ============================
// 📆 ฟังก์ชันสร้าง Flatpickr
// ============================

function setupCalendar(bookings = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // เลือกได้หลังจากวันนี้ +4 วัน
  const minSelectable = new Date(today);
  minSelectable.setDate(today.getDate() + 4);

  const disabledRanges = computeDisabledRanges(bookings);

  // ✅ สร้างปฏิทิน
  flatpickr("#calendar", {
    inline: true,
    mode: "range",
    minDate: minSelectable,
    dateFormat: "Y-m-d",
    disable: disabledRanges,

    // ไฮไลต์วันจองจริง
    onDayCreate: function (dObj, dStr, fp, dayElem) {
      bookings.forEach(b => {
        const start = new Date(b.start);
        const end = new Date(b.end);
        const d = dayElem.dateObj;

        if (d.getTime() === start.getTime()) {
          dayElem.classList.add("booked-start");
        } else if (d.getTime() === end.getTime()) {
          dayElem.classList.add("booked-end");
        } else if (d > start && d < end) {
          dayElem.classList.add("booked-middle");
        }
      });
    },

    // Auto กำหนดวันคืนเมื่อเลือกวันเช่า
    onChange: function (selectedDates, dateStr, instance) {
      if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const end = new Date(start);

        if (mode === "test") {
          end.setDate(start.getDate() + 1); // เทส = 2 วัน
        } else if (mode === "pri") {
          end.setDate(start.getDate() + 2); // ไพร = 3 วัน
        }

        instance.setDate([start, end], true);
      }
    },
  });
}

// ============================
// 🚀 เริ่มทำงาน
// ============================

// productId จาก EJS
document.addEventListener("DOMContentLoaded", () => {
  const calendarEl = document.querySelector("#calendar");
  if (calendarEl) {
    const productId = calendarEl.dataset.productId;
    console.log("🛰️ โหลดข้อมูลการจองของสินค้า:", productId);
    loadBookings(productId);
  }
});