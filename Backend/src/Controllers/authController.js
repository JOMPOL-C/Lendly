const prisma = require('../../prisma/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const bufferToDataUri = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

// กำหนดขนาดไฟล์สูงสุดและชนิดไฟล์ที่อนุญาต
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
exports.upload = upload;

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.Customer.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).render("login", { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    // ✅ ใช้ bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).render("login", { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    const token = jwt.sign(
      { 
        id: user.customer_id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.redirect("/");
  } catch (err) {
    console.error(err);
    return res.status(500).render("login", { error: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
}

// โหลดโปรไฟล์
exports.getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.render("profile", { user: null });
    }

    const user = await prisma.Customer.findUnique({
      where: { customer_id: req.user.id },
      include: { proportion: true },
    });

    // ✅ ใช้ URL จาก Cloudinary
    user.profile_image = user.profile_image_url || null;
    user.card_image = user.id_card_image_url || null;

    res.render("profile", { user });
  } catch (err) {
    console.error("โหลดโปรไฟล์ error:", err);
    res.status(500).render("profile", { user: null, error: "โหลดโปรไฟล์ไม่สำเร็จ" });
  }
};

exports.editprofile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_email,
      customer_phone,
      name,
      last_name,
      address,
      id_card_number,
      chest,
      waist,
      hips
    } = req.body;

    // ดึงไฟล์จาก multer (memoryStorage)
    const profileFile = req.files?.profile_image?.[0];
    const idCardFile = req.files?.id_card_image?.[0];

    // อัปโหลดไป Cloudinary
    let profileUpload = null;
    let idCardUpload = null;

    if (profileFile) {
      const fileUri = bufferToDataUri(profileFile);
      profileUpload = await cloudinary.uploader.upload(fileUri, {
        folder: "lendly_profiles",
      });
    }

    if (idCardFile) {
      const fileUri = bufferToDataUri(idCardFile);
      idCardUpload = await cloudinary.uploader.upload(fileUri, {
        folder: "lendly_id_cards",
      });
    }

    // ดึงข้อมูลเก่ามาเพื่อลบรูปเก่า (ถ้ามี)
    const oldUser = await prisma.Customer.findUnique({
      where: { customer_id: parseInt(id) },
      select: { profile_public_id: true, id_card_public_id: true },
    });

    if (oldUser?.profile_public_id && profileUpload) {
      await cloudinary.uploader.destroy(oldUser.profile_public_id);
    }
    if (oldUser?.id_card_public_id && idCardUpload) {
      await cloudinary.uploader.destroy(oldUser.id_card_public_id);
    }

    // ✅ อัปเดตข้อมูลลูกค้าแบบปลอดภัย (ไม่แตะ id_card_number ถ้าไม่ได้ส่งมา)
    const updateData = {};

    if (customer_email?.trim()) updateData.customer_email = customer_email.trim();
    if (customer_phone?.trim()) updateData.customer_phone = customer_phone.trim();
    if (name?.trim()) updateData.name = name.trim();
    if (last_name?.trim()) updateData.last_name = last_name.trim();
    if (address?.trim()) updateData.address = address.trim();
    if (id_card_number?.trim()) updateData.id_card_number = id_card_number.trim();

    if (profileUpload) {
      updateData.profile_image_url = profileUpload.secure_url;
      updateData.profile_public_id = profileUpload.public_id;
    }
    if (idCardUpload) {
      updateData.id_card_image_url = idCardUpload.secure_url;
      updateData.id_card_public_id = idCardUpload.public_id;
    }

    await prisma.Customer.update({
      where: { customer_id: parseInt(id) },
      data: updateData,
    });

    // อัปเดตหรือสร้าง Proportion
    await prisma.Proportion.upsert({
      where: { customerId: parseInt(id) },
      update: {
        chest: parseFloat(chest) || null,
        waist: parseFloat(waist) || null,
        hips: parseFloat(hips) || null,
      },
      create: {
        customerId: parseInt(id),
        chest: parseFloat(chest) || null,
        waist: parseFloat(waist) || null,
        hips: parseFloat(hips) || null,
      },
    });

    res.redirect("/profile");
  } catch (err) {
    console.error("❌ editprofile error:", err);
    res.status(500).send("อัปเดตไม่สำเร็จ");
  }
};



// แก้ไขโดยใช้ bcrypt ในการ hash รหัสผ่าน
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id; // สมมติว่าคุณมี middleware ที่ตั้งค่า req.user

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).render("changePassword", { error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).render("changePassword", { error: "รหัสผ่านใหม่ไม่ตรงกัน" });
    }

    if (newPassword.length < 8) {
      return res.status(400).render("changePassword", { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" });
    }

    const user = await prisma.Customer.findUnique({ where: { customer_id: userId } });
    if (!user) {
      return res.status(404).render("changePassword", { error: "ไม่พบผู้ใช้" });
    }

    // ✅ ใช้ bcrypt.compare
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).render("changePassword", { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
    }

    // ✅ ใช้ bcrypt.hash
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.Customer.update({
      where: { customer_id: userId },
      data: { password: hashedNewPassword }
    });

    return res.render("changePassword", { success: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err) {
    console.error(err);
    return res.status(500).render("changePassword", { error: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};

// เพิ่มฟังก์ชันสำหรับรีเซ็ตรหัสผ่าน
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmNewPassword } = req.body;

    if (!email || !newPassword || !confirmNewPassword) {
      return res.status(400).render("resetPassword", { error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).render("resetPassword", { error: "รหัสผ่านใหม่ไม่ตรงกัน" });
    }

    if (newPassword.length < 8) {
      return res.status(400).render("resetPassword", { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" });
    }

    const user = await prisma.Customer.findUnique({ where: { customer_email: email } });
    if (!user) {
      return res.status(404).render("resetPassword", { error: "ไม่พบผู้ใช้ที่มีอีเมลนี้" });
    }

    // ✅ ใช้ bcrypt.hash
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.Customer.update({
      where: { customer_email: email },
      data: { password: hashedNewPassword }
    });

    return res.render("resetPassword", { success: "รีเซ็ตรหัสผ่านสำเร็จ" });
  } catch (err) {
    console.error(err);
    return res.status(500).render("resetPassword", { error: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};

