const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    console.log(">>> file:", file);
    console.log(">>> MULTER FILE:", file);
    const allowedTypes = /jpeg|jpg|png/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(
        new Error(
            "Error: file upload only supports the following filetypes - " +
            allowedTypes
        )
    )
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;