const express = require("express");
const router = express.Router();
const controller = require("../Controllers/delayController");

router.get("/admin/delay-setting", controller.renderDelaySetting); 

router.post("/admin/delay-setting", controller.updateDelaySetting);

// API สำหรับ front-end (booking.js)
router.get("/delay-setting", controller.getDelaySetting);

module.exports = router;
