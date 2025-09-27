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