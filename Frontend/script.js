document.getElementById('RegisForm').addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const lastname = document.getElementById('lastname').value.trim();
    const username = document.getElementById('username').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirm_password = document.getElementById('confirm_password').value.trim();
    const confirm = document.getElementById('confirm').checked;
    const errorMsg = document.getElementById("error");

    let errors = [];

    if (name === "") {
        errors.push("กรุณากรอกชื่อ");
    }

    if (lastname === "") {
        errors.push("กรุณากรอกนามสกุล");
    }

    if (username === "") {
        errors.push("กรุณากรอกชื่อผู้ใช้");
    }

    if (password === "") {
        errors.push("กรุณากรอกรหัสผ่าน");
    }

    if (confirm_password === "") {
        errors.push("กรุณายืนยันรหัสผ่าน");
    }

    if (password !== confirm_password) {
        errors.push("รหัสผ่านไม่ตรงกัน");
    }

    if (!confirm) {
        errors.push("กรุณายืนยันเงื่อนไข");
    }

    if (errors.length > 0) {
        errorMsg.innerHTML = errors.map(e => `<div>${e}</div>`).join("");
        return;
    }

    // ถ้าผ่าน validation ทั้งหมด
    console.log("ชื่อ:", name);
    console.log("นามสกุล:", lastname);
    console.log("ชื่อผู้ใช้:", username);
    console.log("เบอร์โทร:", phone);
    console.log("อีเมล:", email);
    // ... อื่น ๆ
});
