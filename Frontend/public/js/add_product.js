// utility function
function toggleField(checkboxId, fieldId) {
  const checkbox = document.getElementById(checkboxId);
  const field = document.getElementById(fieldId);
  if (!checkbox || !field) return;

  field.classList.toggle("hidden", !checkbox.checked);
  checkbox.addEventListener("change", () => {
    field.classList.toggle("hidden", !checkbox.checked);
  });
}

// mapping ของให้เช่า
toggleField("rentCostume", "priceCostume");
toggleField("rentWig", "priceWig");
toggleField("rentProp", "priceProp");
toggleField("rentProp", "priceAddonProp");
toggleField("rentShoe", "priceShoe");
toggleField("rentShoe", "priceAddonShoe");

const rentCostume = document.getElementById("rentCostume");
const rentWig = document.getElementById("rentWig");
const priceSuitWigField = document.getElementById("priceSuitWig");

function updateSuitWigVisibility() {
  if (rentCostume.checked && rentWig.checked) {
    priceSuitWigField.classList.remove("hidden");
  } else {
    priceSuitWigField.classList.add("hidden");
  }
}

// โหลดหน้าครั้งแรก
updateSuitWigVisibility();

// ฟังการเปลี่ยนค่าทั้งสองช่อง
rentCostume.addEventListener("change", updateSuitWigVisibility);
rentWig.addEventListener("change", updateSuitWigVisibility);


// จำนวนวัน Test / Pri
toggleField("useTest", "daysTestField");
toggleField("usePry", "daysPriField");

// การใช้งาน (ไพร) → โชว์ช่องราคาเพิ่ม
const pryCheckbox = document.getElementById("usePry");
const pryExtraField = document.getElementById("pricePryExtra");

if (pryCheckbox && pryExtraField) {
  pryExtraField.classList.add("hidden");
  pryCheckbox.addEventListener("change", () => {
    pryExtraField.classList.toggle("hidden", !pryCheckbox.checked);
  });
}

// Preview รูป
const input = document.getElementById("product_images");
const previewContainer = document.getElementById("preview-container");

if (input && previewContainer) {
  input.addEventListener("change", () => {
    previewContainer.innerHTML = "";

    Array.from(input.files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const div = document.createElement("div");
        div.classList.add("preview-item");
        div.innerHTML = `
          <img src="${e.target.result}" alt="preview-${index}">
          <button type="button" data-index="${index}">✕</button>
        `;
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
