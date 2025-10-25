const admin = require("firebase-admin");
const serviceAccount = require("../../lendly-5ee70-firebase-adminsdk-fbsvc-5a41c913c6.json"); // ไฟล์ที่โหลดจาก Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = db;
