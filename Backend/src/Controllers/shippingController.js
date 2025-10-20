const axios = require('axios');
const prisma = require('../../prisma/prisma');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 📦 Config multer สำหรับอัปโหลดรูปบิล
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'shipping_slips',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});
exports.upload = multer({ storage });

exports.addBox = async (req, res) => {
    const { tracking_code, note, shippingId } = req.body;
  
    try {
      // ตรวจว่ามี shippingId และเป็นตัวเลข
      if (!shippingId || isNaN(Number(shippingId))) {
        return res.status(400).json({ message: "ไม่พบข้อมูล shippingId ที่ถูกต้อง" });
      }
  
      let imageUrl = null;
      if (req.file) imageUrl = req.file.path;
  
      const box = await prisma.shippingBox.create({
        data: {
          shippingId: Number(shippingId), // 👈 แปลงให้แน่ใจว่าเป็น Int
          tracking_code: tracking_code.toUpperCase(),
          note: note || "จัดส่งสินค้าให้ลูกค้า",
        },
      });
  
      // ✅ อัปเดตรูปบิลใน shipping หลัก (ถ้ามี)
      if (imageUrl) {
        await prisma.shipping.update({
          where: { shipping_id: Number(shippingId) },
          data: { image_slip: imageUrl },
        });
      }
  
      res.json({ message: "เพิ่มรหัสพัสดุเรียบร้อย", box });
    } catch (err) {
      console.error("❌ addBox error:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ", error: err.message });
    }
};
  
exports.getTrackingStatus = async (req, res) => {
    try {
        const { rental_id } = req.query;

        const rental = await prisma.rentals.findUnique({
            where: { rental_id: parseInt(rental_id) },
            include: {
                order: {
                    include: {
                        shippings: {
                            include: { boxes: true }
                        }
                    }
                }
            }
        });

        if (!rental) return res.status(404).json({ message: "ไม่พบข้อมูลการเช่า" });

        const trackingCodes = rental.order.shippings.flatMap(s => s.boxes.map(b => b.tracking_code));
        if (trackingCodes.length === 0) return res.json({ message: "ยังไม่มีหมายเลขพัสดุ" });

        const resPost = await axios.post(
            "https://trackapi.thailandpost.co.th/post/api/v1/track",
            { status: "all", language: "TH", barcode: trackingCodes },
            { headers: { Authorization: `Token ${process.env.TH_POST_API_KEY}` } }
        );

        res.json(resPost.data.response.items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
};

exports.getPendingShipments = async (req, res) => {
    try {
      const rentals = await prisma.rentals.findMany({
        where: {
          rental_status: "WAITING_DELIVER",
        },
        include: {
          customer: true,
          product: { include: { images: true } },
          order: {
            include: {
              shippings: {
                include: { boxes: true },
              },
            },
          },
        },
        orderBy: { rental_id: "desc" },
      });
  
      // กรองเฉพาะที่ยังไม่มี tracking code
      const pending = rentals.filter(r => {
        const boxes = r.order?.shippings?.flatMap(s => s.boxes) || [];
        return boxes.length === 0; // ยังไม่มี tracking
      });
  
      res.render("admin_tracking", { title: "จัดส่งสินค้า", pending });
    } catch (err) {
      console.error("❌ getPendingShipments error:", err);
      res.status(500).send("Server error");
    }
};
  