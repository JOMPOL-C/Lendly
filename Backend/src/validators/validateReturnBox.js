const { body } = require("express-validator");
const prisma = require("../../prisma/prisma");

exports.validateReturnBox = [
  body("tracking_code")
    .trim()
    .notEmpty()
    .withMessage("กรุณากรอกรหัสพัสดุ")
    .matches(/^[A-Z]{2}\d{9}TH$/i)
    .withMessage("รหัสพัสดุไม่ถูกต้อง (เช่น EX123456789TH)")
    .custom(async (value) => {
      const existing = await prisma.returnBox.findUnique({
        where: { tracking_code: value.toUpperCase() },
      });
      if (existing) {
        throw new Error("รหัสพัสดุนี้ถูกใช้งานไปแล้ว");
      }
      return true;
    }),
  
  // ตรวจว่ามี order_id และเป็นตัวเลข
  body("order_id")
    .notEmpty()
    .withMessage("ไม่พบข้อมูล order_id")
    .isInt()
    .withMessage("รหัส order_id ต้องเป็นตัวเลข"),
];
