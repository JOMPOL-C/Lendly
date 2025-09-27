const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/prisma");

router.get("/check", async (req, res) => {
  const { field, value } = req.query;
  if (!field || !value) {
    return res.status(400).json({ error: "ต้องส่ง field และ value" });
  }

  try {
    let exists = false;

    if (field === "username") {
      exists = await prisma.Customer.findUnique({ where: { username: value } });
    } else if (field === "email") {
      exists = await prisma.Customer.findUnique({ where: { customer_email: value } });
    } else if (field === "phone") {
      exists = await prisma.Customer.findUnique({ where: { customer_phone: value } });
    }

    return res.json({ exists: !!exists });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
