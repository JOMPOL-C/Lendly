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
      confirm_password,
      birthday
    } = req.body;

    if (!name || !last_name || !customer_email || !customer_phone || !username || !password || !confirm_password || !birthday) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: "รหัสผ่านไม่ตรงกัน" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
    }

    // ✅ คำนวณอายุ
    const birthDate = new Date(birthday);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.Customer.create({
      data: {
        name,
        last_name,
        customer_email,
        customer_phone,
        username,
        password: hashedPassword,
        birthday: new Date(birthday),
        age,
        address: "",
        id_card_number: null,
        role: "USER"
      }
    });

    return res.status(201).json({ message: "สมัครสมาชิกสำเร็จ", user });

  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: `${err.meta.target} ซ้ำ` });
    }
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};


// ลบ account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; // สมมติว่าคุณมี middleware ที่ตั้งค่า req.user

    await prisma.Customer.delete({
      where: { customer_id: userId }
    });

    // ทำการลบ session หรือ token ถ้ามี
    req.logout(); // ถ้าใช้ passport
    req.session.destroy(); // ถ้าใช้ express-session

    return res.status(200).json({ message: "ลบบัญชีผู้ใช้สำเร็จ" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};