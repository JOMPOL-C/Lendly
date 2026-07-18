const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const router = express.Router();
const authController = require('../Controllers/authController');

const thaiProvinceDataDir = path.join(__dirname, '../../data/thai-province');
const thaiProvinceFiles = {
    provinces: path.join(thaiProvinceDataDir, 'province.json'),
    districts: path.join(thaiProvinceDataDir, 'district.json'),
    subDistricts: path.join(thaiProvinceDataDir, 'sub_district.json'),
};
const thaiProvinceCache = new Map();

async function readThaiProvinceFile(filePath) {
    if (thaiProvinceCache.has(filePath)) {
        return thaiProvinceCache.get(filePath);
    }

    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    thaiProvinceCache.set(filePath, parsed);
    return parsed;
}

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
    try {
        const provinces = await readThaiProvinceFile(thaiProvinceFiles.provinces);
        provinces.sort((a, b) => a.name_th.localeCompare(b.name_th, 'th'));
        res.json(provinces);
    } catch (error) {
        console.error('❌ load provinces error:', error);
        res.status(500).json({ error: 'ไม่สามารถโหลดข้อมูลจังหวัดได้' });
    }
});

router.get('/districts/:provinceId', async (req, res) => {
    try {
        const provinceId = parseInt(req.params.provinceId, 10);
        const districts = await readThaiProvinceFile(thaiProvinceFiles.districts);
        const data = districts
            .filter((district) => district.province_id === provinceId)
            .sort((a, b) => a.name_th.localeCompare(b.name_th, 'th'));

        res.json(data);
    } catch (error) {
        console.error('❌ load districts error:', error);
        res.status(500).json({ error: 'ไม่สามารถโหลดข้อมูลอำเภอได้' });
    }
});

router.get('/subdistricts/:districtId', async (req, res) => {
    try {
        const districtId = parseInt(req.params.districtId, 10);
        const subDistricts = await readThaiProvinceFile(thaiProvinceFiles.subDistricts);
        const data = subDistricts
            .filter((subDistrict) => subDistrict.district_id === districtId)
            .sort((a, b) => a.name_th.localeCompare(b.name_th, 'th'));

        res.json(data);
    } catch (error) {
        console.error('❌ load subdistricts error:', error);
        res.status(500).json({ error: 'ไม่สามารถโหลดข้อมูลตำบลได้' });
    }
});

module.exports = router;
