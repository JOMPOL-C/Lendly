const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');


// เรียกดูข้อมูล ผู้ใช้
router
    .route('/auth/login')
    .post(authController.login)

router
    .route('/auth/logout')
    .get(authController.logout)

router
    .route('/profile/update/:id')
    .post(authController.upload.fields([
      { name: "profile_image", maxCount: 1 },
      { name: "id_card_image", maxCount: 1 }
    ]),authController.editprofile);

router
    .route('/profile')
    .get(authController.getProfile);


module.exports = router;