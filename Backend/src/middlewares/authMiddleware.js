const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/prisma');

// ตรวจสอบ JWT จากคุกกี้และตั้งค่า res.locals.user
module.exports = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    // ถ้าไม่มี token -> ไม่ล็อกอิน
    res.locals.user = null;
    req.user = null;
    return next();
  }

  try {
    console.log("Auth middleware triggered:", req.path);

    // ✅ ตรวจสอบและถอดรหัส token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ แปลง key ให้ตรงกับ Prisma model (customer_id)
    decoded.customer_id = decoded.customer_id || decoded.id || decoded.userId;

    // ✅ sync role ล่าสุดจากฐานข้อมูล เผื่อมีการเปลี่ยนสิทธิ์หลังจาก login ไปแล้ว
    if (decoded.customer_id) {
      const latestUser = await prisma.Customer.findUnique({
        where: { customer_id: decoded.customer_id },
        select: { customer_id: true, username: true, role: true },
      });

      if (latestUser) {
        decoded.id = latestUser.customer_id;
        decoded.customer_id = latestUser.customer_id;
        decoded.username = latestUser.username;
        decoded.role = latestUser.role;
      }
    }

    // ✅ ตั้งค่า user ให้ใช้ใน controller หรือ view
    req.user = decoded;
    res.locals.user = decoded;

  } catch (err) {
    console.error('JWT verification failed:', err);
    req.user = null;
    res.locals.user = null;
  }

  next();
};
