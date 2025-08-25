const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const prisma = require('../../services/prisma'); // path ไปหา PrismaClient

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

    // 1. ตรวจสอบว่ามี username/email ซ้ำหรือยัง
    const existingUser = await prisma.customer.findFirst({
      where: {
        OR: [
          { username: username },
          { customer_email: customer_email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Username or Email already exists'
      });
    }

    // 2. Hash password ก่อนเก็บ
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. เตรียมข้อมูล user
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

    // 4. Insert ด้วย Prisma
    const user = await prisma.customer.create({
      data: userData
    });

    // 5. ส่งกลับ (ไม่ส่ง password ออกไป)
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });

  } catch (err) {
    console.error('❌ Registration error:', err);
    if (err.code === 'P2002') {
      // Prisma error P2002 = unique constraint failed
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
