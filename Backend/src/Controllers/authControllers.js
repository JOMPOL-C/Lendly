const prisma = require('../../prisma/prisma');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.Customer.findUnique({
            where: { username: username }
        });
        if (!user) {
            return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
        }
        const isPasswordValid = (password === user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
        }
        return res.status(200).json({ message: "เข้าสู่ระบบสำเร็จ", user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}