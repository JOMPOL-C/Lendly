const { body } = require("express-validator");
const prisma = require("../../prisma/prisma");

exports.validateAddBox = [
  // ✅ ห้ามเว้นว่าง
  body("tracking_code")
    .trim()
    .notEmpty()
    .withMessage("กรุณากรอกรหัสพัสดุ")
    // ✅ รูปแบบรหัสไปรษณีย์ไทย (2 ตัวอักษร + 9 ตัวเลข + TH)
    .matches(/^[A-Z]{2}\d{9}TH$/i)
    .withMessage("รหัสพัสดุไม่ถูกต้อง (เช่น EX123456789TH)")
    // ✅ ตรวจว่าห้ามซ้ำในระบบ
    .custom(async (value) => {
      const existing = await prisma.shippingBox.findUnique({
        where: { tracking_code: value.toUpperCase() }, // ป้องกัน case-sensitive
      });
      if (existing) {
        throw new Error("รหัสพัสดุนี้ถูกใช้งานไปแล้ว");
      }
      return true;
    }),

  // ✅ ตรวจ shippingId ต้องมีและเป็นตัวเลข
  body("shippingId")
    .notEmpty()
    .withMessage("ไม่พบข้อมูล shippingId")
    .isInt()
    .withMessage("รหัส shippingId ต้องเป็นตัวเลข"),
];
