document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("RegisForm");
    if (!form) return console.error("❌ ไม่พบฟอร์ม RegisForm");

    const provinceSelect = document.getElementById("province");
    const districtSelect = document.getElementById("district");
    const subDistrictSelect = document.getElementById("sub_district");
    const postalCodeInput = document.getElementById("postal_code");

    initAddressDropdowns().catch((error) => {
      console.error("❌ โหลดข้อมูลจังหวัดไม่สำเร็จ:", error);
      document.getElementById("form-error").textContent = "ไม่สามารถโหลดข้อมูลจังหวัดได้";
    });
  
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
      const province = provinceSelect?.value.trim();
      const district = districtSelect?.value.trim();
      const sub_district = subDistrictSelect?.value.trim();
      const postal_code = postalCodeInput?.value.trim();
      const address = document.getElementById("address")?.value.trim();
  
      // ✅ ตรวจสอบว่ากรอกครบทุกฟิลด์
      if (!name || !last_name || !phone || !email || !username || !password || !confirmPassword || !birthday || !province || !district || !sub_district || !postal_code || !address) {
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

      if (!province) {
        showFieldError("province", "กรุณาเลือกจังหวัด");
        return;
      }

      if (!district) {
        showFieldError("district", "กรุณาเลือกอำเภอ");
        return;
      }

      if (!sub_district) {
        showFieldError("sub_district", "กรุณาเลือกตำบล");
        return;
      }

      if (!postal_code) {
        showFieldError("postal_code", "กรุณาเลือกรหัสไปรษณีย์");
        return;
      }

      if (!address) {
        showFieldError("address", "กรุณากรอกที่อยู่");
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
        province,
        district,
        sub_district,
        postal_code,
        address,
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

    async function initAddressDropdowns() {
      if (!provinceSelect || !districtSelect || !subDistrictSelect || !postalCodeInput) return;

      const provinces = await fetch("/api/provinces").then((res) => res.json());
      provinceSelect.innerHTML = '<option value="">เลือกจังหวัด</option>';

      provinces.forEach((province) => {
        const option = document.createElement("option");
        option.value = province.name_th;
        option.textContent = province.name_th;
        option.dataset.id = province.id;
        provinceSelect.appendChild(option);
      });

      provinceSelect.addEventListener("change", async () => {
        const provinceId = provinceSelect.options[provinceSelect.selectedIndex]?.dataset.id;
        districtSelect.innerHTML = '<option value="">เลือกอำเภอ</option>';
        subDistrictSelect.innerHTML = '<option value="">เลือกตำบล</option>';
        postalCodeInput.value = "";

        if (!provinceId) return;

        const districts = await fetch(`/api/districts/${provinceId}`).then((res) => res.json());
        districts.forEach((district) => {
          const option = document.createElement("option");
          option.value = district.name_th;
          option.textContent = district.name_th;
          option.dataset.id = district.id;
          districtSelect.appendChild(option);
        });
      });

      districtSelect.addEventListener("change", async () => {
        const districtId = districtSelect.options[districtSelect.selectedIndex]?.dataset.id;
        subDistrictSelect.innerHTML = '<option value="">เลือกตำบล</option>';
        postalCodeInput.value = "";

        if (!districtId) return;

        const subDistricts = await fetch(`/api/subdistricts/${districtId}`).then((res) => res.json());
        subDistricts.forEach((subDistrict) => {
          const option = document.createElement("option");
          option.value = subDistrict.name_th;
          option.textContent = subDistrict.name_th;
          option.dataset.zip = subDistrict.zip_code;
          subDistrictSelect.appendChild(option);
        });
      });

      subDistrictSelect.addEventListener("change", () => {
        const selected = subDistrictSelect.options[subDistrictSelect.selectedIndex];
        postalCodeInput.value = selected?.dataset.zip || "";
      });
    }
  });
  
