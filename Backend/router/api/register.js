const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const prisma = require('../../services/prisma'); // PrismaClient

// สมัครสมาชิก
router.post('/', async (req, res) => {
  try {
    const {
      name,
      last_name,
      customer_email,
      customer_phone,
      address,
      id_card_number,
      username,
      password
    } = req.body;

    // 1. ตรวจสอบซ้ำ
    const conditions = [
      username ? { username } : null,
      customer_email ? { customer_email } : null,
      customer_phone ? { customer_phone } : null,
      id_card_number ? { id_card_number } : null
    ].filter(Boolean);

    const existingUser = conditions.length > 0
      ? await prisma.customer.findFirst({ where: { OR: conditions } })
      : null;

    if (existingUser) {
      return res.status(400).json({
        message: 'Username / Email / Phone / ID card number already exists'
      });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. เตรียมข้อมูล
    const userData = {
      name,
      last_name,
      customer_email,
      customer_phone,
      address,
      id_card_number,
      username,
      password: hashedPassword
    };

    let user;

    try {
      // 4. พยายาม insert ปกติ
      user = await prisma.customer.create({ data: userData });
    } catch (err) {
      // 5. ถ้าเจอ trigger error (Prisma มองไม่เห็น PK) → fallback: query กลับ
      if (err.message.includes("Could not figure out an ID in create")) {
        user = await prisma.customer.findUnique({
          where: { username: userData.username }
        });
      } else {
        throw err;
      }
    }

    // 6. ส่งกลับ (ไม่ส่ง password)
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword
      });
    }

    res.status(500).json({ message: 'User creation failed' });

  } catch (err) {
    console.error('❌ Registration error:', err);

    if (err.code === 'P2002') {
      return res.status(400).json({
        message: 'Duplicate field value violates unique constraint'
      });
    }

    res.status(500).json({
      message: 'Registration failed',
      error: err.message
    });
  }
});

module.exports = router;
