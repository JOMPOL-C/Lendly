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

const categorySelect = document.getElementById("categoryId");
const toggleNewCategoryButton = document.getElementById("toggleNewCategory");
const newCategoryBox = document.getElementById("newCategoryBox");
const newCategoryInput = document.getElementById("newCategoryName");
const addCategoryButton = document.getElementById("addCategoryButton");
const categoryFeedback = document.getElementById("categoryFeedback");

function setCategoryFeedback(message, type = "info") {
  if (!categoryFeedback) return;

  categoryFeedback.textContent = message;
  categoryFeedback.classList.remove("hidden", "is-success", "is-error", "is-info");
  categoryFeedback.classList.add(`is-${type}`);
}

function upsertCategoryOption(category) {
  if (!categorySelect || !category?.category_id || !category?.category_name) return;

  let option = Array.from(categorySelect.options).find(
    (item) => item.value === category.category_id
  );

  if (!option) {
    option = document.createElement("option");
    option.value = category.category_id;
    option.textContent = category.category_name;
    categorySelect.appendChild(option);
  } else {
    option.textContent = category.category_name;
  }

  categorySelect.value = category.category_id;
}

async function createCategoryFromInput() {
  const categoryName = newCategoryInput?.value.trim();

  if (!categoryName) {
    setCategoryFeedback("กรุณากรอกชื่อหมวดหมู่ก่อน", "error");
    newCategoryInput?.focus();
    return;
  }

  if (!addCategoryButton) return;

  addCategoryButton.disabled = true;
  addCategoryButton.textContent = "กำลังเพิ่ม...";

  try {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category_name: categoryName }),
    });

    const payload = await response.json().catch(() => ({}));
    const category = payload.category || payload;

    if (!response.ok) {
      if (response.status === 409 && category?.category_id) {
        upsertCategoryOption(category);
        setCategoryFeedback("มีหมวดหมู่นี้อยู่แล้ว ระบบเลือกให้เรียบร้อย", "info");
        newCategoryInput.value = "";
        return;
      }

      throw new Error(payload.message || "ไม่สามารถเพิ่มหมวดหมู่ได้");
    }

    upsertCategoryOption(category);
    setCategoryFeedback("เพิ่มหมวดหมู่ใหม่สำเร็จ", "success");
    newCategoryInput.value = "";
  } catch (error) {
    setCategoryFeedback(error.message || "เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่", "error");
  } finally {
    addCategoryButton.disabled = false;
    addCategoryButton.textContent = "เพิ่มหมวด";
  }
}

if (toggleNewCategoryButton && newCategoryBox) {
  toggleNewCategoryButton.addEventListener("click", () => {
    const isHidden = newCategoryBox.classList.toggle("hidden");
    toggleNewCategoryButton.textContent = isHidden
      ? "ไม่มีหมวดหมู่ที่ต้องการ? เพิ่มหมวดใหม่"
      : "ซ่อนฟอร์มเพิ่มหมวดหมู่";

    if (!isHidden) {
      setCategoryFeedback("พิมพ์ชื่อหมวดหมู่ใหม่แล้วกดเพิ่มหมวดได้เลย", "info");
      newCategoryInput?.focus();
    }
  });
}

if (addCategoryButton) {
  addCategoryButton.addEventListener("click", createCategoryFromInput);
}

if (newCategoryInput) {
  newCategoryInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      createCategoryFromInput();
    }
  });
}
