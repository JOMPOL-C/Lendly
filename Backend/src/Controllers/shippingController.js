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

const storageReturn = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'return_receipts',  // ✅ แยกโฟลเดอร์ใหม่สำหรับใบเสร็จคืนสินค้า
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});
const uploadReturn = multer({ storage: storageReturn });

// แล้ว export ไว้ใช้เฉพาะ route คืนสินค้า
exports.uploadReturn = uploadReturn;

// 🧩 ฟังก์ชันขอ Token จากไปรษณีย์ไทย
let thaiPostToken = null;
let thaiPostExpire = 0;

async function getThaiPostToken() {
    const now = Date.now();

    if (thaiPostToken && now < thaiPostExpire) return thaiPostToken;

    console.log("🔑 ขอ token ใหม่จากไทยโพสต์...");
    console.log("📡 ใช้ Header:", { Authorization: `Token ${process.env.TH_POST_API_KEY?.slice(0, 25)}...` });

    // ✅ ยิงขอ token จากไปรษณีย์ไทย
    const res = await axios.post(
        'https://trackapi.thailandpost.co.th/post/api/v1/authenticate/token',
        {},
        { headers: { Authorization: `Token ${process.env.TH_POST_API_KEY}` } }
    );

    console.log("✅ ได้ token:", res.data.token?.slice(0, 30) + "...");

    thaiPostToken = res.data.token;
    thaiPostExpire = now + 55 * 60 * 1000; // อายุ 55 นาที
    return thaiPostToken;
}

// ===================================================
// เพิ่มข้อมูลกล่องจัดส่ง
// ===================================================

exports.addBox = async (req, res) => {
    try {
        const { tracking_code, note, shippingId } = req.body;
        let { orderItemIds } = req.body;

        if (!shippingId)
            return res.status(400).json({ message: "กรุณาระบุ shippingId" });
        if (!tracking_code)
            return res.status(400).json({ message: "กรุณากรอกรหัสพัสดุ" });

        // ✅ แปลง orderItemIds จาก JSON string → array
        if (typeof orderItemIds === "string") {
            orderItemIds = JSON.parse(orderItemIds);
        }

        if (!Array.isArray(orderItemIds) || orderItemIds.length === 0) {
            return res.status(400).json({ message: "ไม่พบสินค้าที่จะผูกเข้ากล่อง" });
        }

        // ✅ อัปโหลดรูปบิล (ถ้ามี)
        let imageUrl = null;
        if (req.file) imageUrl = req.file.path;

        // ✅ ตรวจสอบว่า orderItemIds ที่ได้รับ มีอยู่จริงในระบบไหม
        const validOrderItems = await prisma.orderItem.findMany({
            where: { orderItem_id: { in: orderItemIds.map(Number) } },
            select: { orderItem_id: true, productId: true, orderId: true },
        });

        if (validOrderItems.length !== orderItemIds.length) {
            return res.status(400).json({
                message:
                    "พบ orderItemId ไม่ถูกต้องในคำขอ — โปรดตรวจสอบสินค้าอีกครั้ง",
            });
        }

        // ✅ สร้างกล่องใหม่
        const newBox = await prisma.shippingBox.create({
            data: {
                shippingId: Number(shippingId),
                tracking_code: tracking_code.toUpperCase(),
                note: note || "กล่องพัสดุใหม่",
            },
        });

        console.log("📦 สร้างกล่องใหม่:", newBox.box_id);
        console.log("🧩 ผูกสินค้า:", orderItemIds.join(", "));

        // ✅ ผูกสินค้าแต่ละตัวเข้ากล่อง
        await prisma.shippingBoxItem.createMany({
            data: validOrderItems.map((item) => ({
                boxId: newBox.box_id,
                orderItemId: item.orderItem_id,
                quantity: 1,
            })),
        });

        // ✅ แนบรูปบิลไว้ที่ shipping (ถ้ามี)
        if (imageUrl) {
            await prisma.shipping.update({
                where: { shipping_id: Number(shippingId) },
                data: { image_slip: imageUrl },
            });
            console.log("🧾 แนบรูปบิลเรียบร้อย");
        }

        // ✅ ดึงข้อมูลสินค้าที่เกี่ยวข้อง
        const productIds = validOrderItems.map((i) => i.productId);
        const orderId = validOrderItems[0].orderId;

        console.log("📦 จะอัปเดต rentals ของสินค้า:", productIds);
        console.log("📦 จากคำสั่งซื้อ:", orderId);

        // ✅ อัปเดตเฉพาะสินค้าที่พร้อมส่งเท่านั้น (WAITING_DELIVER)
        const updated = await prisma.rentals.updateMany({
            where: {
                orderId: orderId,
                productId: { in: productIds },
                rental_status: "WAITING_DELIVER",
            },
            data: { rental_status: "WAITING_RECEIVE" },
        });

        console.log(
            `🚚 อัปเดตสถานะ rental เป็น WAITING_RECEIVE จำนวน ${updated.count} รายการ`
        );

        // ✅ ตอบกลับ
        res.json({
            message: `เพิ่มกล่องพัสดุ ${tracking_code.toUpperCase()} สำเร็จ (ผูกสินค้า ${productIds.length} ชิ้น)`,
            box_id: newBox.box_id,
        });
    } catch (err) {
        console.error("❌ addBox error:", err);
        res
            .status(500)
            .json({ message: "เกิดข้อผิดพลาดในระบบ", error: err.message });
    }
};



// ===================================================
// ดึงสถานะพัสดุ (Thai Post API)
// ===================================================
exports.getTrackingStatus = async (req, res) => {
    try {
        const { rental_id } = req.query;
        const rental = await prisma.rentals.findUnique({
            where: { rental_id: parseInt(rental_id) },
            include: {
                order: { include: { shippings: { include: { boxes: true } } } },
            },
        });

        if (!rental) return res.status(404).json({ message: 'ไม่พบข้อมูลการเช่า' });

        const trackingCodes = rental.order.shippings.flatMap((s) =>
            s.boxes.map((b) => b.tracking_code)
        );
        if (trackingCodes.length === 0)
            return res.json({ message: 'ยังไม่มีหมายเลขพัสดุ' });

        // ✅ ขอ token ก่อนยิง API
        const token = await getThaiPostToken();

        const resPost = await axios.post(
            'https://trackapi.thailandpost.co.th/post/api/v1/track',
            { status: 'all', language: 'TH', barcode: trackingCodes },
            { headers: { Authorization: `Token ${token}` } }
        );

        res.json(resPost.data.response.items);
    } catch (err) {
        console.error('❌ getTrackingStatus error:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};

// ===================================================
// ดึงสถานะพัสดุแบบ timeline
// ===================================================
exports.getTimelineStatus = async (req, res) => {
    try {
        const { rental_id } = req.query;
        if (!rental_id)
            return res.status(400).json({ message: "ต้องระบุ rental_id" });

        const rental = await prisma.rentals.findUnique({
            where: { rental_id: parseInt(rental_id) },
            include: {
                order: { include: { shippings: { include: { boxes: true } } } },
            },
        });

        if (!rental)
            return res.status(404).json({ message: "ไม่พบข้อมูลการเช่า" });

        let step = 1;
        let label = "สร้างคำสั่งซื้อ";

        // ✅ STEP BY STATUS – กำหนดล่วงหน้าก่อนเรียก API
        switch (rental.rental_status) {
            case "WAITING_CONFIRM":
                step = 1;
                label = "รอยืนยันจากร้าน";
                break;
            case "WAITING_DELIVER":
                step = 2;
                label = "เตรียมส่งสินค้า";
                break;
            case "WAITING_RECEIVE":
                step = 3;
                label = "กำลังจัดส่งสินค้า";
                break;
            case "RENTED":
                step = 4;
                label = "ลูกค้าได้รับสินค้าแล้ว";
                break;
            case "RETURNING":
                step = 5;
                label = "ลูกค้ากำลังคืนสินค้า";
                break;
            case "RETURNED":
                step = 6;
                label = "ร้านได้รับสินค้าคืนแล้ว";
                break;
            default:
                step = 1;
                label = "สร้างคำสั่งซื้อ";
        }

        console.log("🧩 RENTAL STATUS DEBUG", rental.rental_status);

        // ✅ ตรวจสอบ tracking จริงจาก ThaiPost (เพิ่มความแม่นยำ)
        const trackingCodes = rental.order?.shippings?.flatMap((s) =>
            s.boxes.map((b) => b.tracking_code)
        ) || [];

        if (trackingCodes.length > 0) {
            try {
                const token = await getThaiPostToken();
                const resPost = await axios.post(
                    "https://trackapi.thailandpost.co.th/post/api/v1/track",
                    { status: "all", language: "TH", barcode: trackingCodes },
                    { headers: { Authorization: `Token ${token}` } }
                );

                const data = resPost.data.response.items;
                const allEvents = Object.values(data).flat();
                const latest = allEvents.sort(
                    (a, b) => new Date(b.status_date) - new Date(a.status_date)
                )[0];

                const code = Number(latest?.status_code);

                if (code >= 201 && code < 300) {
                    step = 3;
                    label = "กำลังจัดส่งสินค้า";
                    await prisma.rentals.update({
                        where: { rental_id: parseInt(rental_id) },
                        data: { rental_status: "WAITING_RECEIVE" },
                    });
                } else if (code === 501) {
                    step = 4;
                    label = "ลูกค้าได้รับสินค้าแล้ว";
                    await prisma.rentals.update({
                        where: { rental_id: parseInt(rental_id) },
                        data: { rental_status: "RENTED" },
                    });
                }
            } catch (err) {
                console.warn("⚠️ ThaiPost API error:", err.message);
            }
        }

        // ✅ ตรวจสอบพัสดุขากลับ (ถ้ามี)
        if (rental.return_tracking_code) {
            const token = await getThaiPostToken();
            const resReturn = await axios.post(
                "https://trackapi.thailandpost.co.th/post/api/v1/track",
                {
                    status: "all",
                    language: "TH",
                    barcode: [rental.return_tracking_code],
                },
                { headers: { Authorization: `Token ${token}` } }
            );

            const dataR = resReturn.data.response.items;
            const latestR = Object.values(dataR)
                .flat()
                .sort((a, b) => new Date(b.status_date) - new Date(a.status_date))[0];

            if (latestR?.status_description.includes("อยู่ระหว่างการขนส่ง")) {
                step = 5;
                label = "ลูกค้ากำลังคืนสินค้า";
            } else if (
                latestR?.status_description.includes("นำจ่ายสำเร็จ") ||
                latestR?.status_description.includes("ผู้รับได้รับแล้ว")
            ) {
                step = 6;
                label = "ร้านได้รับสินค้าคืนแล้ว";
                await prisma.rentals.update({
                    where: { rental_id: parseInt(rental_id) },
                    data: { rental_status: "RETURNED" },
                });
            }
        }

        // ✅ เงื่อนไขสุดท้ายสำหรับรีวิว
        if (rental.rental_status === "RETURNED") {
            step = 7;
            label = "รีวิวสินค้าได้แล้ว";
        }

        return res.json({ step, label });
    } catch (err) {
        console.error("❌ getTimelineStatus error:", err);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการดึงสถานะจากไปรษณีย์ไทย",
        });
    }
};


// ===================================================
// ดึง shipment ที่ยังไม่ส่ง
// ===================================================
exports.getPendingShipments = async (req, res) => {
    try {
        const rentals = await prisma.rentals.findMany({
            where: { rental_status: 'WAITING_DELIVER' },
            include: {
                customer: true,
                product: { include: { images: true } },
                order: {
                    include: {
                        shippings: { include: { boxes: { include: { items: true } } } },
                        OrderItem: true,
                    },
                },
            },
            orderBy: { rental_id: 'desc' },
        });

        // ✅ กรองสินค้าเฉพาะตัวที่ยังไม่มี tracking_code
        const pending = rentals.filter((r) => {
            const boxes = r.order?.shippings?.flatMap(s => s.boxes) || [];

            // มีสินค้าใน orderItem ที่ตรงกับสินค้านี้หรือยัง
            const matchedBox = boxes.find(b =>
                b.ShippingBoxItem?.some(item =>
                    item.orderItemId === r.order?.OrderItem?.find(i => i.productId === r.product.product_id)?.orderItem_id
                )
            );
            console.log("🧩 Rental:", r.product.product_name, "Boxes:", boxes.map(b => b.tracking_code));

            // ✅ ถ้า matchedBox ไม่มี (หมายถึงสินค้านี้ยังไม่อยู่ในกล่องไหนเลย)
            return !matchedBox;
        });

        console.log("📦 Pending rentals:", pending.map(p => ({
            id: p.rental_id,
            name: p.product.product_name
        })));

        res.render('admin_tracking', { title: 'จัดส่งสินค้า', pending });
    } catch (err) {
        console.error('❌ getPendingShipments error:', err);
        res.status(500).send('Server error');
    }
};

// ===================================================
// ดึงกล่องพัสดุของ order
// ===================================================
exports.getOrderBoxes = async (req, res) => {
    try {
        const { order_id } = req.query;

        const order = await prisma.order.findUnique({
            where: { order_id: parseInt(order_id) },
            include: {
                shippings: {
                    include: {
                        boxes: {
                            include: {
                                shipping: {
                                    include: {
                                        order: {
                                            include: {
                                                Rentals: {
                                                    include: {
                                                        product: { include: { images: true } },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!order) return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อนี้' });

        const boxes = order.shippings.flatMap((s) =>
            s.boxes.map((b) => ({
                tracking_code: b.tracking_code,
                note: b.note,
                rentals: s.order.Rentals.filter(
                    (r) => r.order_id === order.order_id
                ).map((r) => ({
                    product_name: r.product.product_name,
                    image: r.product.images?.[0]?.image_url,
                    rental_id: r.rental_id,
                })),
            }))
        );

        res.json({ boxes });
    } catch (err) {
        console.error('❌ getOrderBoxes error:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงกล่องจัดส่ง' });
    }
};

exports.confirmReceived = async (req, res) => {
    try {
        const { rental_id } = req.body;
        const files = req.files; // อาจอัปได้หลายรูป
        if (!rental_id) return res.status(400).json({ message: "ต้องระบุ rental_id" });

        const rental = await prisma.rentals.findUnique({
            where: { rental_id: parseInt(rental_id) },
        });
        if (!rental) return res.status(404).json({ message: "ไม่พบข้อมูลการเช่า" });
        if (rental.rental_status !== "WAITING_RECEIVE")
            return res.status(400).json({ message: "สถานะนี้ไม่สามารถกดยืนยันได้" });

        // ✅ อัปโหลดรูปขึ้น Cloudinary
        const uploadedImages = [];
        for (const file of files || []) {
            uploadedImages.push({ rental_id: rental.rental_id, image_url: file.path });
        }

        // ✅ เก็บรูปในตารางใหม่ (RentalReceiveImage)
        if (uploadedImages.length > 0) {
            await prisma.rentalReceiveImage.createMany({ data: uploadedImages });
        }

        // ✅ อัปเดตสถานะ + เวลารับสินค้า
        await prisma.rentals.update({
            where: { rental_id: rental.rental_id },
            data: {
                rental_status: "RENTED",
                received_at: new Date(),
            },
        });

        res.json({ message: "ยืนยันได้รับสินค้าแล้ว", images: uploadedImages });
    } catch (err) {
        console.error("❌ confirmReceived error:", err);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
};

exports.createReturnBox = async (req, res) => {
    try {
        const { order_id, tracking_code, rental_ids, note } = req.body;
        const file = req.file;

        if (!tracking_code || !rental_ids?.length)
            return res.status(400).json({ message: "ต้องระบุรหัสพัสดุและสินค้าที่จะคืน" });

        // ✅ สร้างกล่องคืนสินค้า
        const newBox = await prisma.returnBox.create({
            data: {
                orderId: parseInt(order_id),
                tracking_code: tracking_code.toUpperCase(),
                note: note || null,
            },
        });

        // ✅ ผูกสินค้าทั้งหมดเข้ากล่อง
        await prisma.returnBoxItem.createMany({
            data: rental_ids.map(id => ({
                boxId: newBox.box_id,
                rentalId: parseInt(id),
            })),
        });

        // ✅ เปลี่ยนสถานะสินค้าที่เลือกเป็น RETURNING
        await prisma.rentals.updateMany({
            where: { rental_id: { in: rental_ids.map(Number) } },
            data: { rental_status: "RETURNING" },
        });

        await prisma.rentals.updateMany({
            where: { rental_id: { in: rental_ids.map(Number) } },
            data: { return_tracking_code: tracking_code.toUpperCase() },
        });
        
        if (file) {
            await prisma.returnBox.update({
                where: { box_id: newBox.box_id },
                data: { note: file.path },
            });
        }

        res.json({ message: "สร้างกล่องคืนสินค้าเรียบร้อย", box_id: newBox.box_id });
    } catch (err) {
        console.error("❌ createReturnBox error:", err);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
};


console.log("TH_POST_API_KEY:", process.env.TH_POST_API_KEY?.slice(0, 25) + "...");
exports.getThaiPostToken = getThaiPostToken;
