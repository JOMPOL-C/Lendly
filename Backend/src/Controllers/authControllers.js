const prisma = require('../../prisma/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const multer = require('multer');
const path = require('path');

const fs = require("fs");

// กำหนดที่เก็บไฟล์และชื่อไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
    filename: (req, file, cb) =>
        cb(null, Date.now() + path.extname(file.originalname))
});

exports.upload = multer({ storage });


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
            { id: user.customer_id, username: user.username },
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
  
      let user = await prisma.Customer.findUnique({
        where: { customer_id: req.user.id },
        include: { proportion: true },
      });
  
      // แปลง Buffer เป็น base64 ก่อนส่งไป render
      if (user?.profile_image) {
        user.profile_image = Buffer.from(user.profile_image).toString("base64");
      }
  
      if (user?.card_image) {
        user.card_image = Buffer.from(user.card_image).toString("base64");
      }
  
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
        bust,
        waist,
        hips
      } = req.body;
  
      // ดึงไฟล์จาก multer
      const profileFile = req.files?.profile_image?.[0];
      const idCardFile = req.files?.id_card_image?.[0];
  
      // อัปเดต Customer
      await prisma.Customer.update({
        where: { customer_id: parseInt(id) },
        data: {
          customer_email,
          customer_phone,
          name,
          last_name,
          address,
          id_card_number,
          ...(profileFile && {
            profile_image: fs.readFileSync(profileFile.path), // เก็บ binary
            profile_mime: profileFile.mimetype                // เก็บ mimetype
          }),
          ...(idCardFile && {
            id_card_image: fs.readFileSync(idCardFile.path),
            id_card_mime: idCardFile.mimetype
          }),
        },
      });
  
      // อัปเดตหรือสร้าง Proportion
      await prisma.Proportion.upsert({
        where: { customerId: parseInt(id) },
        update: {
          chest: parseFloat(bust) || null,
          waist: parseFloat(waist) || null,
          hips: parseFloat(hips) || null,
        },
        create: {
          customerId: parseInt(id),
          chest: parseFloat(bust) || null,
          waist: parseFloat(waist) || null,
          hips: parseFloat(hips) || null,
        },
      });
      
      res.redirect("/profile");
    } catch (err) {
      console.error(err);
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

