document.getElementById("RegisForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // ล้าง error เก่าทุกครั้งที่ submit
    clearErrors();

    const name = document.getElementById("name").value.trim();
    const last_name = document.getElementById("last_name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

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

    // ส่งข้อมูลไป backend
    const formData = {
        name,
        last_name,
        customer_phone: phone,
        customer_email: email,
        username,
        password,
        confirm_password: confirmPassword
    };

    try {
        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (res.ok) {
            window.location.href = "/login"; // สมัครเสร็จ → ไปหน้า login
        } 
    } catch (err) {
        document.getElementById("form-error").textContent = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";
    }
});

function showFieldError(field, message) {
    document.getElementById(`${field}-error`).textContent = message;
}

function clearErrors() {
    document.querySelectorAll(".error-text").forEach(el => el.textContent = "");
    document.getElementById("form-error").textContent = "";
}

const fieldLabels = {
    username: "ชื่อผู้ใช้",
    email: "อีเมล",
    phone: "เบอร์โทรศัพท์"
  };
  
  async function checkDuplicate(field, value) {
    if (!value) return;
    try {
      const res = await fetch(`/check?field=${field}&value=${encodeURIComponent(value)}`);
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
document.getElementById("username").addEventListener("blur", (e) => {
    checkDuplicate("username", e.target.value);
});
document.getElementById("email").addEventListener("blur", (e) => {
    checkDuplicate("email", e.target.value);
});
document.getElementById("phone").addEventListener("blur", (e) => {
    checkDuplicate("phone", e.target.value);
});

const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  togglePassword.classList.toggle("bx-show");
  togglePassword.classList.toggle("bx-hide");
});

const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const confirmPasswordInput = document.getElementById("confirm_password");

toggleConfirmPassword.addEventListener("click", () => {
  const type = confirmPasswordInput.type === "password" ? "text" : "password";
  confirmPasswordInput.type = type;
  toggleConfirmPassword.classList.toggle("bx-show");
  toggleConfirmPassword.classList.toggle("bx-hide");
});
