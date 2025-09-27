const prisma = require('../../prisma/prisma');
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { 
      name, 
      last_name, 
      customer_email, 
      customer_phone, 
      username, 
      password, 
      confirm_password 
    } = req.body;

    if (!name || !last_name || !customer_email || !customer_phone || !username || !password || !confirm_password) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: "รหัสผ่านไม่ตรงกัน" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.Customer.create({
      data: {
        name,
        last_name,
        customer_email,
        customer_phone,
        username,
        password: hashedPassword,
        address: "",
        id_card_number: null,
        card_image: null
      }
    });

    return res.status(201).json({ message: "สมัครสมาชิกสำเร็จ", user });

  } catch (err) {
    // ✅ จัดการ Prisma unique error
    if (err.code === "P2002") {
      return res.status(400).json({ error: `${err.meta.target} ซ้ำ ` });
    }
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
