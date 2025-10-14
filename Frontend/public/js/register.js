document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("RegisForm");
    if (!form) return console.error("❌ ไม่พบฟอร์ม RegisForm");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();
  
      const name = document.getElementById("name")?.value.trim();
      const last_name = document.getElementById("last_name")?.value.trim();
      const phone = document.getElementById("phone")?.value.trim();
      const email = document.getElementById("email")?.value.trim();
      const username = document.getElementById("username")?.value.trim();
      const password = document.getElementById("password")?.value;
      const confirmPassword = document.getElementById("confirm_password")?.value;
      const birthday = document.getElementById("birthday")?.value.trim();
      const id_card_number = document.getElementById("id_card_number")?.value.trim();
  
      // ✅ ตรวจสอบว่ากรอกครบทุกฟิลด์
      if (!name || !last_name || !phone || !email || !username || !password || !confirmPassword) {
        document.getElementById("form-error").textContent = "กรุณากรอกข้อมูลให้ครบทุกช่อง";
        return;
      }
  
      // ✅ ความยาวรหัสผ่าน
      if (password.length < 8) {
        showFieldError("password", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
        return;
      }
  
      // ✅ confirm password
      if (password !== confirmPassword) {
        showFieldError("confirm_password", "รหัสผ่านไม่ตรงกัน");
        return;
      }
  
      // ✅ เบอร์โทร 10 หลัก
      if (!/^\d{10}$/.test(phone)) {
        showFieldError("phone", "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก");
        return;
      }
  
      // ✅ อีเมล
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError("email", "รูปแบบอีเมลไม่ถูกต้อง");
        return;
      }
  
      // ✅ เลขบัตรประชาชน 13 หลัก
      if (id_card_number && !/^\d{13}$/.test(id_card_number)) {
        showFieldError("id_card_number", "กรุณากรอกเลขบัตรประชาชน 13 หลัก");
        return;
      }
  
      // ✅ วันเกิด (อายุ 16+)
      if (!birthday) {
        showFieldError("birthday", "กรุณาเลือกวันเกิด");
        return;
      }
  
      const birthDate = new Date(birthday);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 16) {
        showFieldError("birthday", "อายุต้องไม่น้อยกว่า 16 ปี");
        return;
      }
  
      // ✅ ส่งข้อมูลไป backend
      const formData = {
        name,
        last_name,
        customer_phone: phone,
        customer_email: email,
        username,
        password,
        confirm_password: confirmPassword,
        id_card_number,
        birthday,
      };
  
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
  
        const data = await res.json();
        console.log("📥 Response:", res.status, data);
  
        if (res.ok) {
          window.location.href = "/login";
        } else {
          document.getElementById("form-error").textContent =
            data.message || "สมัครไม่สำเร็จ กรุณาลองใหม่";
        }
      } catch (err) {
        document.getElementById("form-error").textContent = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";
      }
    });
  
    function showFieldError(field, message) {
      const el = document.getElementById(`${field}-error`);
      if (el) el.textContent = message;
    }
  
    function clearErrors() {
      document.querySelectorAll(".error-text").forEach((el) => (el.textContent = ""));
      document.getElementById("form-error").textContent = "";
    }
  
    const fieldLabels = {
      username: "ชื่อผู้ใช้",
      email: "อีเมล",
      phone: "เบอร์โทรศัพท์",
      id_card_number: "เลขบัตรประชาชน",
    };
  
    async function checkDuplicate(field, value) {
      if (!value) return;
      try {
        const res = await fetch(`/api/register/check?field=${field}&value=${encodeURIComponent(value)}`);
        const data = await res.json();
  
        if (data.exists) {
          showFieldError(field, `${fieldLabels[field]} นี้ถูกใช้งานแล้ว`);
        } else {
          showFieldError(field, "");
        }
      } catch (err) {
        console.error("Error checking duplicate:", err);
      }
    }
  
    // === blur events ===
    ["username", "email", "phone", "id_card_number"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("blur", (e) => checkDuplicate(id, e.target.value));
    });
  
    // === toggle password ===
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    if (togglePassword && passwordInput) {
      togglePassword.addEventListener("click", () => {
        const type = passwordInput.type === "password" ? "text" : "password";
        passwordInput.type = type;
        togglePassword.classList.toggle("bx-show");
        togglePassword.classList.toggle("bx-hide");
      });
    }
  
    const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
    const confirmPasswordInput = document.getElementById("confirm_password");
    if (toggleConfirmPassword && confirmPasswordInput) {
      toggleConfirmPassword.addEventListener("click", () => {
        const type = confirmPasswordInput.type === "password" ? "text" : "password";
        confirmPasswordInput.type = type;
        toggleConfirmPassword.classList.toggle("bx-show");
        toggleConfirmPassword.classList.toggle("bx-hide");
      });
    }
  });
  