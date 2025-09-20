let mode = "test"; // ค่าเริ่มต้น

// เปลี่ยนโหมด
document.querySelectorAll("input[name=mode]").forEach(radio => {
  radio.addEventListener("change", e => {
    mode = e.target.value;
  });
});

// --------------------------
// 📌 สมมุติข้อมูลจองจาก backend
const bookings = [
   //{ start: "2025-09-25", end: "2025-09-27" },
  // { start: "2025-10-05", end: "2025-10-07" }
];

// วันนี้
const today = new Date();
today.setHours(0,0,0,0);

// ✅ เลือกได้วันนี้ +4 วัน (เว้น 3 วันเต็มก่อนหน้า)
const minSelectable = new Date(today);
minSelectable.setDate(today.getDate() + 4);

// คำนวณช่วง disable
const disabledRanges = bookings.map(b => {
  let start = new Date(b.start);
  let end = new Date(b.end);

  // กัน 3 วันก่อนวันเช่า (ส่งของไปถึง)
  let startMinus3 = new Date(start);
  startMinus3.setDate(start.getDate() - 3);

  // กัน 6+3 = 9 วันหลังวันคืน (ทำความสะอาด + ส่งต่อ)
  let endPlus9 = new Date(end);
  endPlus9.setDate(end.getDate() + 9);

  return {
    from: startMinus3.toISOString().split("T")[0],
    to: endPlus9.toISOString().split("T")[0]
  };
});

// --------------------------
// 📌 Flatpickr
flatpickr("#calendar", {
  inline: true,
  mode: "range",
  minDate: minSelectable,   // 👈 ใช้ today +4
  dateFormat: "Y-m-d",
  disable: disabledRanges,
  onDayCreate: function(dObj, dStr, fp, dayElem) {
    // highlight วันจองจริง
    bookings.forEach(b => {
      const start = new Date(b.start);
      const end   = new Date(b.end);
      const d     = dayElem.dateObj;

      if (d.getTime() === start.getTime()) {
        dayElem.classList.add("booked-start");
      } else if (d.getTime() === end.getTime()) {
        dayElem.classList.add("booked-end");
      } else if (d > start && d < end) {
        dayElem.classList.add("booked-middle");
      }
    });
  },
  onChange: function(selectedDates, dateStr, instance) {
    if (selectedDates.length === 1) {
      const start = selectedDates[0];
      const end = new Date(start);

      if (mode === "test") {
        end.setDate(start.getDate() + 1); // เทส 2 วัน
      } else if (mode === "pri") {
        end.setDate(start.getDate() + 2); // ไพร 3 วัน
      }

      instance.setDate([start, end], true);
    }
  }
});
