// ============================
// 📅 booking.js – สำหรับ Detail_Pro.ejs
// ============================

// 🌈 โหมดเริ่มต้น
let mode = "test";
let isSettingDate = false;

// ============================
// 🔔 ฟังก์ชัน tooltip แจ้งเตือน
// ============================
function showTooltip(message) {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip-alert";
  tooltip.textContent = message;
  document.body.appendChild(tooltip);
  setTimeout(() => tooltip.classList.add("show"), 10);
  setTimeout(() => {
    tooltip.classList.remove("show");
    setTimeout(() => tooltip.remove(), 500);
  }, 2500);
}

// ============================
// 🎚 เปลี่ยนโหมด เทส / ไพร
// ============================
document.querySelectorAll("input[name=mode]").forEach(radio => {
  radio.addEventListener("change", e => {
    mode = e.target.value;

    const calendarEl = document.querySelector("#calendar");
    if (calendarEl && calendarEl._flatpickr) {
      calendarEl._flatpickr.clear();
    }

    showTooltip("โหมดเช่าเปลี่ยนแล้ว กรุณาเลือกวันใหม่ ✨");
    console.log("🔄 เปลี่ยนโหมดเป็น:", mode);
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

    const bookings = data.map(b => ({
      start: fixLocalDate(b.start),
      end: fixLocalDate(b.end),
    }));

    function fixLocalDate(dateStr) {
      // ✅ ไม่แตะ timezone offset — ใช้วันที่ที่ได้จาก backend ตรง ๆ
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0); // เคลียร์เวลาเพื่อกันเหลื่อมวัน
      return d;
    }



    setupCalendar(bookings);
  } catch (err) {
    console.error("❌ loadBookings error:", err);
    setupCalendar([]);
  }
}

// ============================
// 🧮 คำนวณช่วงวัน disable จาก delaySetting
// ============================
async function computeDisabledRanges(bookings, delay) {
  return bookings.map(b => {
    const start = new Date(b.start);
    const end = new Date(b.end);

    const startMinus = new Date(start);
    startMinus.setDate(start.getDate() - delay.delay_ship_days);

    const endPlus = new Date(end);
    endPlus.setDate(
      end.getDate() +
      delay.delay_return_days +
      delay.delay_clean_days +
      delay.delay_ship_days
    );

    function formatDateLocal(date) {
      const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return d.toISOString().split("T")[0];
    }

    return {
      from: formatDateLocal(startMinus),
      to: formatDateLocal(endPlus),
    };
  });
}

// ============================
// 📆 ฟังก์ชันสร้าง Flatpickr + logic กันวัน
// ============================
async function setupCalendar(bookings = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const delay = await fetch("/api/delay-setting").then(r => r.json());
  console.log("🕒 Delay Setting:", delay);

  // ✅ กำหนดวันเริ่มเช่าได้เร็วสุด (กันเวลาแอดมิน + ส่ง)
  const minSelectable = new Date(today);
  minSelectable.setDate(today.getDate() + delay.delay_ship_days + delay.delay_admin_days);

  // ✅ ให้จองล่วงหน้าได้สูงสุด 3 เดือน
  const maxSelectable = new Date(today);
  maxSelectable.setMonth(today.getMonth() + 3);
  maxSelectable.setDate(maxSelectable.getDate() + 1); // ✅ เพิ่ม 1 วัน


  // ✅ disable วันคิวที่ทับ
  const disabledRanges = await computeDisabledRanges(bookings, delay);

  // ✅ หาวันสุดท้ายที่จองไว้
  const latestEnd = bookings.reduce((latest, b) => {
    const end = new Date(b.end);
    const cleanEnd = new Date(end);
    cleanEnd.setDate(
      end.getDate() +
      delay.delay_return_days +
      delay.delay_clean_days +
      delay.delay_next_ship_days
    );
    return cleanEnd > latest ? cleanEnd : latest;
  }, today);

  // ✅ บล็อกช่วงนี้เลยแทนที่จะรอ alert
  if (latestEnd > today) {
    disabledRanges.push({
      from: today.toISOString().split("T")[0],
      to: latestEnd.toISOString().split("T")[0],
    });
  }


  // ============================
  // 🗓️ Flatpickr setup
  // ============================
  const calendar = flatpickr("#calendar", {
    inline: true,
    mode: "range",
    dateFormat: "Y-m-d",
    minDate: minSelectable,
    maxDate: maxSelectable,
    disable: disabledRanges,

    // 💅 สีแต่ละช่วง
    onDayCreate: function (_, __, ___, dayElem) {
      const d = dayElem.dateObj;
      bookings.forEach(b => {
        const start = new Date(b.start);
        const end = new Date(b.end);

        const shipBeforeStart = new Date(start);
        shipBeforeStart.setDate(start.getDate() - delay.delay_ship_days);

        const afterReturn = new Date(end);
        afterReturn.setDate(end.getDate() + delay.delay_return_days);

        const cleanEnd = new Date(end);
        cleanEnd.setDate(end.getDate() + delay.delay_return_days + delay.delay_clean_days);

        const nextShip = new Date(cleanEnd);
        nextShip.setDate(cleanEnd.getDate() + delay.delay_ship_days);

        const rentEnd = new Date(end);
        rentEnd.setDate(end.getDate() + 1);

        if (d >= shipBeforeStart && d < start);
        else if (d >= start && d < rentEnd) dayElem.classList.add("day-rent");
        else if (d > end && d <= afterReturn);
        else if (d > afterReturn && d <= cleanEnd);
        else if (d > cleanEnd && d <= nextShip);
      });
    },

    // 📅 เมื่อผู้ใช้เลือกวัน
    onChange: function (selectedDates, _, instance) {
      if (isSettingDate) return;

      if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const daysDiff = Math.floor((start - today) / (1000 * 60 * 60 * 24));

        // ✅ ห้ามจองเร็วเกินไป
        if (daysDiff < (delay.delay_ship_days + delay.delay_admin_days)) {
          alert(`⛔ ต้องเลือกวันเช่าที่ห่างจากวันนี้อย่างน้อย ${delay.delay_ship_days + delay.delay_admin_days} วัน`);
          instance.clear();
          return;
        }

        // 🚫 ห้ามจองซ้ำรอบก่อนหน้า
        if (start <= latestEnd) {
          alert("⛔ ไม่สามารถจองได้ เพราะยังอยู่ในช่วงบล็อคของรอบก่อนหน้า");
          instance.clear();
          return;
        }

        // ✅ ตั้งวันสิ้นสุดตามโหมด
        isSettingDate = true;
        const end = new Date(start);
        if (mode === "test") end.setDate(start.getDate() + 1);
        else if (mode === "pri") end.setDate(start.getDate() + 2);
        instance.setDate([start, end], true);
        isSettingDate = false;
      }
    },
  });



  // 🧹 เคลียร์วันที่เมื่อเปลี่ยนโหมด
  document.querySelectorAll("input[name=mode]").forEach(radio => {
    radio.addEventListener("change", () => {
      mode = radio.value;
      calendar.clear();
      showTooltip("เปลี่ยนโหมดแล้ว กรุณาเลือกวันใหม่ ✨");
    });
  });
}

// ============================
// 🚀 เริ่มทำงานเมื่อหน้าโหลดเสร็จ
// ============================
window.addEventListener("load", () => {
  const calendarEl = document.querySelector("#calendar");
  if (!calendarEl) return console.warn("⚠️ ไม่พบ element #calendar");

  const productId = calendarEl.dataset.productId;
  console.log("🛰️ โหลดข้อมูลการจองของสินค้า:", productId);
  loadBookings(productId);
});
