const prisma = require("../../prisma/prisma");

exports.renderUserDepositPage = async (req, res) => {
  try {
    const customerId = req.user?.customer_id; // มาจาก token ที่ setUser ใส่ไว้
    if (!customerId) return res.redirect("/login");

    const rentals = await prisma.rentals.findMany({
      where: {
        customerId: customerId,
        rental_status: "Deposit_Refunded"
      },
      include: {
        product: { include: { images: true } }
      },
      orderBy: { refund_date: "desc" }
    });

    res.render("deposit_user", { rentals });
  } catch (err) {
    console.error("❌ renderUserDepositPage error:", err);
    res.status(500).send("Server Error");
  }
};
