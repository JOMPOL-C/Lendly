const QRCode = require("qrcode");
const generatePayload = require("promptpay-qr");

// ✅ สร้าง QR PromptPay ด้วย library (มั่นใจสแกนได้ทุกธนาคาร)
exports.generatePromptPayQR = async (req, res) => {
  try {
    const { amount } = req.body;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0)
      return res.status(400).json({ message: "จำนวนเงินไม่ถูกต้อง" });

    const phone = process.env.PROMPTPAY_PHONE || "0836463812";

    // ใช้ library สร้าง payload พร้อมคำนวณ CRC อัตโนมัติ
    const payload = generatePayload(phone, { amount: amountNum });

    // แปลงเป็น QR image
    const qrImage = await QRCode.toDataURL(payload);

    res.json({ qrImage, payload, amount: amountNum });
  } catch (err) {
    console.error("❌ generatePromptPayQR error:", err);
    res.status(500).json({ message: "สร้าง QR ล้มเหลว" });
  }
};
