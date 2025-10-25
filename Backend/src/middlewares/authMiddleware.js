const jwt = require('jsonwebtoken');

// ตรวจสอบ JWT จากคุกกี้และตั้งค่า res.locals.user
module.exports = (req, res, next) => {
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
