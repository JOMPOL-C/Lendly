const prisma = require('../../prisma/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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