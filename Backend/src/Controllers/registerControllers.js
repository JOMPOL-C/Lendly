const prisma = require('../../prisma/prisma');
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
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
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.Customer.create({
            data: {
                name: name,
                last_name: last_name,
                customer_email: customer_email,
                customer_phone: customer_phone,
                address: address,
                id_card_number: id_card_number,
                username: username,
                password: hashedPassword
            }
        });
        return res.status(201).json({ message: "สมัครสมาชิกสำเร็จ", user });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}