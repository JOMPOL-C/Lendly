const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getThaiPostToken } = require('../Controllers/shippingController');

// ✅ ดึงสถานะพัสดุแบบตรง
router.get('/tracking/detail', async (req, res) => {
    const { tracking_code } = req.query;
    if (!tracking_code)
        return res.status(400).json({ message: 'ต้องระบุ tracking_code' });

    try {
        const token = await getThaiPostToken();
        const response = await axios.post(
            'https://trackapi.thailandpost.co.th/post/api/v1/track',
            { status: 'all', language: 'TH', barcode: [tracking_code] },
            { headers: { Authorization: `Token ${token}` } }
        );

        const items = response.data.response.items?.[tracking_code] || [];
        if (!items.length)
            return res.status(404).json({ message: 'ไม่พบข้อมูลพัสดุ' });

        const tracks = items.map(i => ({
            status: i.status_description,
            date: i.status_date,
            location: i.location || '-',
            detail: i.status_detail || '-',
        }));

        res.json({ tracks });
    } catch (err) {
        console.error('❌ Thai Post API Error:', err.response?.status, err.response?.data);
        res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลจากไปรษณีย์ไทยได้' });
    }
});

module.exports = router;
