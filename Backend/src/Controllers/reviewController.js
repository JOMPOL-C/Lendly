const prisma = require('../../prisma/prisma');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ตั้งค่า Cloudinary สำหรับอัปโหลดรูปรีวิว
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'reviews',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});
exports.upload = multer({ storage });

// ✅ แสดงหน้าเขียนรีวิว พร้อมสินค้าที่คืนแล้ว
exports.renderWriteReview = async (req, res) => {
    try {
        const customerId = req.user.customer_id;

        // ดึงสินค้าที่อยู่ในสถานะ RETURNED เท่านั้น
        const rentals = await prisma.rentals.findMany({
            where: {
                customerId,
                rental_status: 'RETURNED',
            },
            include: {
                product: {
                    include: { images: true },
                },
            },
            orderBy: { rental_id: 'desc' },
        });

        res.render('write_review', { rentals });
    } catch (err) {
        console.error('❌ renderWriteReview error:', err);
        res.status(500).send('เกิดข้อผิดพลาดในการโหลดหน้าการเขียนรีวิว');
    }
};

// ✅ เขียนรีวิว
exports.createReview = async (req, res) => {
    try {
        const { reviewText, productId, rentalId } = req.body;
        const customerId = req.user.customer_id;

        // ตรวจสอบว่ามีการเช่าจริงและคืนแล้ว
        const rental = await prisma.rentals.findUnique({
            where: { rental_id: parseInt(rentalId) },
        });

        console.log("🧩 [DEBUG REVIEW]");
        console.log("customerId from token:", customerId);
        console.log("rentalId from body:", rentalId);
        console.log("productId from body:", productId);
        console.log("found rental:", rental);
        if (!rental || rental.customerId !== customerId || rental.rental_status !== 'RETURNED') {
            return res.status(400).json({ message: 'คุณยังไม่สามารถรีวิวสินค้านี้ได้' });
        }

        const review = await prisma.review.create({
            data: {
                reviewText,
                productId: parseInt(productId),
                rentalId: parseInt(rentalId),
                customerId,
            },
        });

        // ถ้ามีรูปแนบมา
        if (req.files?.length) {
            const images = req.files.map(file => ({
                reviewId: review.review_id,
                image_url: file.path,
            }));
            await prisma.reviewImage.createMany({ data: images });
        }

        res.redirect('/all_review');
    } catch (err) {
        console.error('❌ createReview error:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกรีวิว' });
    }
};

// ✅ แสดงหน้ารีวิวทั้งหมด
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            include: {
                product: true,
                customer: {
                    select: {
                        name: true,
                        profile_image_url: true, // ✅ field เก็บลิงก์ Cloudinary
                    },
                },
                images: true,
            },
            orderBy: { created_at: 'desc' },
        });

        // ✅ ส่งตัวแปร reviews ให้ EJS ใช้
        res.render('all_review', { reviews });
    } catch (err) {
        console.error('❌ getAllReviews error:', err);
        res.status(500).send('เกิดข้อผิดพลาดในการโหลดรีวิวทั้งหมด');
    }
};
