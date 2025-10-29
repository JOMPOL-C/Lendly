const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ สำหรับอัปโหลดสลิปคืนมัดจำ
const refundStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'deposit_refunds',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const uploadRefund = multer({ storage: refundStorage });

module.exports = { uploadRefund };
