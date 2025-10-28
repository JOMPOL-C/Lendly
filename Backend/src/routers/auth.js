const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const prisma = require('../../prisma/prisma');

// 🔐 Auth routes
router
    .post('/auth/login', authController.login);
router
    .get('/auth/logout', authController.logout);

// 🔧 Update profile (with image upload)
router
    .post('/profile/update/:id', authController.upload.fields([
        { name: "profile_image", maxCount: 1 },
        { name: "id_card_image", maxCount: 1 }
    ]),
        authController.editprofile
    );

// 👤 View profile
router.get('/profile', authController.getProfile);

// 🌏 Province / District / Sub-district APIs
router.get('/provinces', async (req, res) => {
    const provinces = await prisma.provinces.findMany({ orderBy: { name_th: 'asc' } });
    res.json(provinces);
});

router.get('/districts/:provinceId', async (req, res) => {
    const data = await prisma.districts.findMany({
        where: { province_id: parseInt(req.params.provinceId) },
        orderBy: { name_th: 'asc' },
    });
    res.json(data);
});

router.get('/subdistricts/:districtId', async (req, res) => {
    const data = await prisma.sub_districts.findMany({
        where: { district_id: parseInt(req.params.districtId) },
        orderBy: { name_th: 'asc' },
    });
    res.json(data);
});

module.exports = router;
