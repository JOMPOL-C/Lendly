const jwt = require('jsonwebtoken');

// ตรวจสอบ JWT จากคุกกี้และตั้งค่า res.locals.user
module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.locals.user = null; // ถ้าไม่มี token ให้ตั้งค่า user เป็น null
    return next();
  }

  // ตรวจสอบและถอดรหัส token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = decoded; // ตั้งค่า user จากข้อมูลที่ถอดรหัสได้
  } catch (err) {
    console.error('JWT verification failed:', err);
    res.locals.user = null; // ถ้า token ไม่ถูกต้อง ให้ตั้งค่า user เป็น null
  }
  next();
};