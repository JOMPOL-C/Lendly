const prisma = require("../../prisma/prisma");

// ✅ ตรวจสอบความครบของโปรไฟล์ก่อนเช่า
exports.validateProfileBeforeRent = async (req, res, next) => {
  try {
    const userId = req.user?.customer_id; // ต้องมี middleware auth ก่อน
    if (!userId) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });

    const user = await prisma.Customer.findUnique({
      where: { customer_id: userId },
      select: {
        customer_phone: true,
        address: true,
        province: true,
        district: true,
        sub_district: true,
        postal_code: true,
        id_card_number: true,
        id_card_image_url: true,
      },
    });

    // ✅ รายการฟิลด์ที่ต้องตรวจสอบ
    const missing = [];
    if (!user.customer_phone) missing.push("เบอร์โทรศัพท์");
    if (!user.address) missing.push("ที่อยู่");
    if (!user.province) missing.push("จังหวัด");
    if (!user.district) missing.push("อำเภอ");
    if (!user.sub_district) missing.push("ตำบล");
    if (!user.postal_code) missing.push("รหัสไปรษณีย์");
    if (!user.id_card_number) missing.push("เลขบัตรประชาชน");
    if (!user.id_card_image_url) missing.push("รูปบัตรประชาชน");

    if (missing.length > 0) {
      return res.status(400).json({
        message: `⚠️ โปรไฟล์ของคุณยังไม่สมบูรณ์: ${missing.join(", ")}`,
      });
    }

    next(); // ผ่าน ✅
  } catch (err) {
    console.error("❌ validateProfileBeforeRent error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูลผู้ใช้" });
  }
};
