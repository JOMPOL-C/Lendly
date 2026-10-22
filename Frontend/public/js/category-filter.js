document.addEventListener("DOMContentLoaded", () => {
  const filterForm = document.querySelector("[data-auto-filter]");
  const resultsContainer = document.querySelector("[data-products-results]");
  const resultsSummary = document.querySelector("[data-results-summary]");
  if (!filterForm || !resultsContainer) return;

  const filterInputs = filterForm.querySelectorAll('input[type="number"]');
  const liveNote = filterForm.querySelector(".filter-live-note");
  let submitTimer;
  let activeRequest;

  const setLiveNote = (message) => {
    if (liveNote) liveNote.textContent = message;
  };

  const buildParams = () => {
    const formData = new FormData(filterForm);
    const params = new URLSearchParams();

    formData.forEach((value, key) => {
      const normalizedValue = String(value).trim();
      if (normalizedValue) params.set(key, normalizedValue);
    });

    return params;
  };

  const updateSummary = ({ count, hasFilters }) => {
    if (!resultsSummary) return;
    resultsSummary.textContent = hasFilters
      ? `พบ ${count} รายการ ที่ตรงกับตัวกรอง`
      : `พบ ${count} รายการ พร้อมให้เลือกเช่าตามสไตล์ที่ต้องการ`;
  };

  const updateBrowserUrl = (params) => {
    const nextUrl = params.toString() ? `/products?${params.toString()}` : "/products";
    window.history.replaceState({}, "", nextUrl);
  };

  const fetchFilteredProducts = async () => {
    const params = buildParams();
    const requestUrl = `/products/partial?${params.toString()}`;

    if (activeRequest) activeRequest.abort();
    activeRequest = new AbortController();

    resultsContainer.classList.add("is-loading");
    setLiveNote("กำลังกรองสินค้า...");

    try {
      const response = await fetch(requestUrl, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
        signal: activeRequest.signal,
      });

      if (!response.ok) throw new Error("โหลดผลลัพธ์ไม่สำเร็จ");

      const payload = await response.json();
      resultsContainer.innerHTML = payload.html;
      updateSummary(payload);
      updateBrowserUrl(params);
      window.bindFavoriteButtons?.(resultsContainer);
      setLiveNote("กรองอัตโนมัติแล้ว");
    } catch (error) {
      if (error.name === "AbortError") return;
      setLiveNote("โหลดแบบเร็วไม่สำเร็จ กำลังโหลดหน้าใหม่");
      filterForm.submit();
    } finally {
      resultsContainer.classList.remove("is-loading");
    }
  };

  const scheduleFetch = () => {
    window.clearTimeout(submitTimer);
    setLiveNote("รอสักครู่ กำลังเตรียมกรองอัตโนมัติ");
    submitTimer = window.setTimeout(fetchFilteredProducts, 550);
  };

  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    window.clearTimeout(submitTimer);
    fetchFilteredProducts();
  });

  filterInputs.forEach((input) => {
    input.addEventListener("input", scheduleFetch);
    input.addEventListener("change", scheduleFetch);
  });
});
