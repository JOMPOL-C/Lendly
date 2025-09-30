// utility function
function toggleField(checkboxId, fieldId) {
    const checkbox = document.getElementById(checkboxId);
    const field = document.getElementById(fieldId);

    if (!checkbox || !field) return;

    // โหลดหน้ามา → ถ้าไม่ได้ติ๊ก ให้ซ่อน
    field.classList.toggle("hidden", !checkbox.checked);

    // เวลาเปลี่ยนค่า
    checkbox.addEventListener("change", () => {
        field.classList.toggle("hidden", !checkbox.checked);
    });
}

// mapping ของให้เช่า
toggleField("rentCostume", "priceCostume");
toggleField("rentWig", "priceWig");
toggleField("rentProp", "priceProp");
toggleField("rentShoe", "priceShoe");
// จำนวนวัน Test
toggleField("useTest", "daysTestField");

// จำนวนวัน Pri
toggleField("usePry", "daysPriField");


// การใช้งาน (ไพร) → โชว์ช่องราคาเพิ่ม
const pryCheckbox = document.getElementById("usePry");
const pryExtraField = document.getElementById("pricePryExtra");

if (pryCheckbox && pryExtraField) {
    pryExtraField.classList.add("hidden"); // โหลดหน้ามาก็ซ่อนก่อน
    pryCheckbox.addEventListener("change", () => {
        pryExtraField.classList.toggle("hidden", !pryCheckbox.checked);
    });
}

const input = document.getElementById("product_images");
const previewContainer = document.getElementById("preview-container");

if (input && previewContainer) {
  input.addEventListener("change", () => {
    previewContainer.innerHTML = ""; // ล้าง preview เดิม

    Array.from(input.files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const div = document.createElement("div");
        div.classList.add("preview-item");

        div.innerHTML = `
          <img src="${e.target.result}" alt="preview-${index}">
          <button type="button" data-index="${index}">✕</button>
        `;

        // ลบรูปออกจาก input.files
        div.querySelector("button").addEventListener("click", () => {
          removeFile(index);
          div.remove();
        });

        previewContainer.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  });

  function removeFile(removeIndex) {
    const dt = new DataTransfer();
    Array.from(input.files).forEach((file, idx) => {
      if (idx !== removeIndex) dt.items.add(file);
    });
    input.files = dt.files;
  }
}
