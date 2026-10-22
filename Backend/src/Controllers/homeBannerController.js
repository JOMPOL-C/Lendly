const prisma = require("../../prisma/prisma");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const storage = multer.memoryStorage();
exports.upload = multer({ storage }).array("banner_images", 6);

const bufferToDataUri = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

exports.renderAdminHomeBanner = async (req, res) => {
  try {
    const banners = await prisma.HomeBanner.findMany({
      where: { is_active: true },
      orderBy: [
        { display_order: "asc" },
        { homeBanner_id: "desc" },
      ],
      take: 6,
    });

    res.render("admin_home_banner", { banners });
  } catch (err) {
    console.error("❌ renderAdminHomeBanner error:", err);
    res.status(500).send("โหลดหน้าจัดการแบนเนอร์ไม่สำเร็จ");
  }
};

exports.createHomeBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      link_url,
      button_text,
      is_active,
    } = req.body;

    const activeBannerCount = await prisma.HomeBanner.count({
      where: { is_active: true },
    });
    const remainingSlots = Math.max(0, 6 - activeBannerCount);
    const files = (req.files || []).slice(0, remainingSlots);

    if (!title || files.length === 0) {
      return res.status(400).send("กรุณากรอกหัวข้อและอัปโหลดรูปแบนเนอร์อย่างน้อย 1 รูป หรือรูปแบนเนอร์อาจครบ 6 รูปแล้ว");
    }

    const startOrder = activeBannerCount + 1;
    const uploadResults = await Promise.all(
      files.map((file) =>
        cloudinary.uploader.upload(bufferToDataUri(file), {
          folder: "lendly_home_banners",
        })
      )
    );

    await prisma.HomeBanner.createMany({
      data: uploadResults.map((uploadResult, index) => ({
        title,
        subtitle: subtitle || null,
        image_url: uploadResult.secure_url,
        cloudinary_id: uploadResult.public_id,
        link_url: link_url || "/products",
        button_text: button_text || "ดูชุดทั้งหมด",
        is_active: is_active === "on",
        display_order: startOrder + index,
      })),
    });

    res.redirect("/admin/home-banner");
  } catch (err) {
    console.error("❌ createHomeBanner error:", err);
    res.status(500).send("บันทึกแบนเนอร์ไม่สำเร็จ");
  }
};

exports.updateHomeBannerStatus = async (req, res) => {
  try {
    const bannerId = parseInt(req.params.id, 10);
    const banner = await prisma.HomeBanner.findUnique({
      where: { homeBanner_id: bannerId },
    });

    if (!banner) return res.status(404).send("ไม่พบแบนเนอร์");

    await prisma.HomeBanner.update({
      where: { homeBanner_id: bannerId },
      data: { is_active: !banner.is_active },
    });

    res.redirect("/admin/home-banner");
  } catch (err) {
    console.error("❌ updateHomeBannerStatus error:", err);
    res.status(500).send("อัปเดตสถานะแบนเนอร์ไม่สำเร็จ");
  }
};

exports.reorderHomeBanners = async (req, res) => {
  try {
    const bannerIds = Array.isArray(req.body.bannerIds)
      ? req.body.bannerIds.map((id) => parseInt(id, 10)).filter(Boolean)
      : [];

    if (bannerIds.length === 0) {
      return res.status(400).json({ success: false, message: "ไม่มีลำดับแบนเนอร์ที่ต้องอัปเดต" });
    }

    await prisma.$transaction(
      bannerIds.map((bannerId, index) =>
        prisma.HomeBanner.update({
          where: { homeBanner_id: bannerId },
          data: { display_order: index + 1 },
        })
      )
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ reorderHomeBanners error:", err);
    res.status(500).json({ success: false, message: "บันทึกลำดับแบนเนอร์ไม่สำเร็จ" });
  }
};

exports.deleteHomeBanner = async (req, res) => {
  try {
    const bannerId = parseInt(req.params.id, 10);
    const banner = await prisma.HomeBanner.findUnique({
      where: { homeBanner_id: bannerId },
    });

    if (!banner) return res.status(404).send("ไม่พบแบนเนอร์");

    if (banner.cloudinary_id) {
      await cloudinary.uploader.destroy(banner.cloudinary_id);
    }

    await prisma.HomeBanner.delete({
      where: { homeBanner_id: bannerId },
    });

    res.redirect("/admin/home-banner");
  } catch (err) {
    console.error("❌ deleteHomeBanner error:", err);
    res.status(500).send("ลบแบนเนอร์ไม่สำเร็จ");
  }
};
