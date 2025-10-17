const prisma = require("../../prisma/prisma");

module.exports = async (req, res, next) => {
  if (req.user) {
    let user = await prisma.Customer.findUnique({
      where: { customer_id: req.user.id }
    });

    if (user?.profile_image) {
      user.profile_image = Buffer.from(user.profile_image).toString("base64");
    }

    res.locals.user = user; // 👈 ส่ง user ไปทุก EJS
  } else {
    res.locals.user = null;
  }
  next();
};