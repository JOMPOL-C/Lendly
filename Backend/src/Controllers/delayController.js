const prisma = require("../../prisma/prisma");

// ============================
// 🧭 หน้าแอดมินตั้งค่า Delay
// ============================
exports.renderDelaySetting = async (req, res) => {
    try {
        let delay = await prisma.delaySetting.findFirst();

        // ถ้าไม่มีในฐานข้อมูล → สร้างค่า default
        if (!delay) {
            delay = {
                delay_ship_days: 3,
                delay_return_days: 3,
                delay_clean_days: 5,
                delay_next_ship_days: 3,
                delay_admin_days: 2,
            };
        }

        // คำนวณรวม
        const plus_delay_days =
            delay.delay_ship_days +
            delay.delay_return_days +
            delay.delay_clean_days +
            delay.delay_next_ship_days +
            delay.delay_admin_days;

        res.render("delay_setting", { delay: { ...delay, plus_delay_days } });
    } catch (error) {
        console.error("❌ renderDelaySetting error:", error);
        res.status(500).send("ไม่สามารถโหลดข้อมูล Delay Setting ได้");
    }
};


// ============================
// 📦 API ดึงค่าดีเลย์ (ให้ booking.js ใช้)
// ============================
exports.getDelaySetting = async (req, res) => {
    try {
      const setting = await prisma.delaySetting.findFirst();
  
      // ถ้ายังไม่มีข้อมูลใน DB → ส่ง default
      if (!setting) {
        return res.json({
          delay_ship_days: 3,
          delay_return_days: 3,
          delay_clean_days: 5,
          delay_next_ship_days: 3,
          delay_admin_days: 2,
          plus_delay_days: 16,
        });
      }
  
      // คำนวณรวม
      const plus_delay_days =
        setting.delay_ship_days +
        setting.delay_return_days +
        setting.delay_clean_days +
        setting.delay_next_ship_days +
        setting.delay_admin_days;
  
      // ✅ ส่ง response เดียวเท่านั้น
      return res.json({
        delay_ship_days: setting.delay_ship_days,
        delay_return_days: setting.delay_return_days,
        delay_clean_days: setting.delay_clean_days,
        delay_next_ship_days: setting.delay_next_ship_days,
        delay_admin_days: setting.delay_admin_days,
        plus_delay_days,
      });
    } catch (error) {
      console.error("❌ getDelaySetting error:", error);
      return res.status(500).json({
        message: "ไม่สามารถโหลด delay setting ได้",
        delay_ship_days: 3,
        delay_return_days: 3,
        delay_clean_days: 5,
        delay_next_ship_days: 3,
        delay_admin_days: 2,
        plus_delay_days: 16,
      });
    }
  };
  

// ============================
// ⚙️ อัปเดตค่าดีเลย์จากหน้าแอดมิน
// ============================
// อัปเดตค่าดีเลย์ (จากหน้า admin)
exports.updateDelaySetting = async (req, res) => {
    try {
        const {
            delay_ship_days,
            delay_return_days,
            delay_clean_days,
            delay_next_ship_days,
            delay_admin_days
        } = req.body;

        const existing = await prisma.delaySetting.findFirst();

        const data = {
            delay_ship_days: parseInt(delay_ship_days),
            delay_return_days: parseInt(delay_return_days),
            delay_clean_days: parseInt(delay_clean_days),
            delay_next_ship_days: parseInt(delay_next_ship_days),
            delay_admin_days: parseInt(delay_admin_days),
            updated_at: new Date(),
        };

        if (existing) {
            await prisma.delaySetting.update({
                where: { delaySetting_id: existing.delaySetting_id },
                data,
            });
        } else {
            await prisma.delaySetting.create({ data });
        }

        res.redirect("/api/admin/delay-setting");
    } catch (error) {
        console.error("❌ updateDelaySetting error:", error);
        res.status(500).send("ไม่สามารถบันทึกการตั้งค่าได้");
    }
};

