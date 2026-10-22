document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.querySelector("[data-preview-image-input]");
  const uploadDropzone = imageInput?.closest("label");
  const bannerManager = document.querySelector("[data-banner-manager]");
  const saveOrderButton = document.querySelector("[data-save-banner-order]");
  const maxFiles = Math.max(0, parseInt(imageInput?.dataset.maxFiles || "6", 10));

  let draggedPanel = null;
  let isDirty = false;

  const normalizeSelectedFiles = () => {
    if (!imageInput || imageInput.files.length <= maxFiles) return;

    const dataTransfer = new DataTransfer();
    Array.from(imageInput.files)
      .slice(0, maxFiles)
      .forEach((file) => dataTransfer.items.add(file));
    imageInput.files = dataTransfer.files;
  };

  const setDirty = () => {
    if (isDirty) return;
    isDirty = true;
    saveOrderButton?.classList.remove("hidden");
  };

  const updatePanelState = () => {
    if (!bannerManager) return;

    const panels = Array.from(bannerManager.querySelectorAll("[data-banner-id]"));
    panels.forEach((panel, index) => {
      panel.classList.toggle("is-expanded", index === 0);
      const position = panel.querySelector(".admin-banner-position");
      if (position) position.textContent = index + 1;
    });
  };

  const getPanelAfterCursor = (xPosition) => {
    if (!bannerManager) return null;

    return Array.from(bannerManager.querySelectorAll("[data-banner-id]:not(.is-dragging)"))
      .reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = xPosition - box.left - box.width / 2;

          if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
          }

          return closest;
        },
        { offset: Number.NEGATIVE_INFINITY, element: null }
      ).element;
  };

  imageInput?.addEventListener("change", normalizeSelectedFiles);

  uploadDropzone?.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadDropzone.classList.add("border-violet-500", "bg-violet-100");
  });

  uploadDropzone?.addEventListener("dragleave", () => {
    uploadDropzone.classList.remove("border-violet-500", "bg-violet-100");
  });

  uploadDropzone?.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadDropzone.classList.remove("border-violet-500", "bg-violet-100");

    if (maxFiles === 0) return;

    const files = Array.from(event.dataTransfer?.files || []).slice(0, maxFiles);
    if (files.length === 0 || !imageInput) return;

    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    imageInput.files = dataTransfer.files;
  });

  bannerManager?.addEventListener("dragstart", (event) => {
    const panel = event.target.closest("[data-banner-id]");
    if (!panel) return;

    draggedPanel = panel;
    panel.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
  });

  bannerManager?.addEventListener("dragend", () => {
    draggedPanel?.classList.remove("is-dragging");
    draggedPanel = null;
    updatePanelState();
  });

  bannerManager?.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (!draggedPanel || !bannerManager) return;

    const afterElement = getPanelAfterCursor(event.clientX);
    if (afterElement === draggedPanel) return;

    if (afterElement) {
      bannerManager.insertBefore(draggedPanel, afterElement);
    } else {
      bannerManager.appendChild(draggedPanel);
    }

    updatePanelState();
    setDirty();
  });

  saveOrderButton?.addEventListener("click", async () => {
    if (!bannerManager || !isDirty) return;

    const bannerIds = Array.from(bannerManager.querySelectorAll("[data-banner-id]"))
      .map((panel) => panel.dataset.bannerId);

    saveOrderButton.disabled = true;
    saveOrderButton.textContent = "กำลังบันทึก...";

    try {
      const response = await fetch("/admin/home-banner/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerIds }),
      });

      if (!response.ok) throw new Error("Failed to save banner order");

      window.location.reload();
    } catch (error) {
      console.error(error);
      saveOrderButton.disabled = false;
      saveOrderButton.textContent = "บันทึกลำดับ";
      alert("บันทึกลำดับไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  });

  updatePanelState();
});
