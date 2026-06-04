(function () {
  const ACCESS_KEY = "vf2026";
  const STORAGE_KEY = "hubProtectedAccess";
  const DEFAULT_HUB_URL = "https://petervfd.github.io/haupt/";

  function getCurrentPageId() {
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    if (pathParts.length === 0) return "unknown";
    return pathParts[pathParts.length - 1].toLowerCase();
  }

  function loadAccessData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveAccessData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function cleanupExpired(data) {
    const now = Date.now();
    for (const key in data) {
      if (!data[key] || data[key] < now) {
        delete data[key];
      }
    }
    return data;
  }

  function grantAccessFromUrl(currentPageId) {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access");
    const page = params.get("page");

    if (access === ACCESS_KEY && page === currentPageId) {
      let data = loadAccessData();
      data = cleanupExpired(data);
      data[currentPageId] = Date.now() + 15 * 60 * 1000;
      saveAccessData(data);

      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }

  function isAllowed(currentPageId) {
    let data = loadAccessData();
    data = cleanupExpired(data);
    saveAccessData(data);

    return !!data[currentPageId] && data[currentPageId] > Date.now();
  }

  function blockPage() {
    const hubUrl = window.PROTECTED_HUB_URL || DEFAULT_HUB_URL;
    document.body.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f4f6f8;
        font-family: Arial, sans-serif;
        padding: 20px;
        box-sizing: border-box;
      ">
        <div style="
          background: white;
          max-width: 520px;
          width: 100%;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          padding: 28px;
          text-align: center;
        ">
          <h2 style="margin-top: 0; color: #1f2937;">Zugriff verweigert</h2>
          <p style="color: #6b7280; line-height: 1.5; margin-bottom: 24px;">
            Diese Seite darf nur über die Hub-Seite geöffnet werden
            oder die Freigabe ist abgelaufen.
          </p>
          <a href="${hubUrl}" style="
            display: inline-block;
            background: #0066cc;
            color: white;
            text-decoration: none;
            padding: 12px 18px;
            border-radius: 10px;
            font-weight: bold;
          ">Zur Startseite</a>
        </div>
      </div>
    `;
    document.body.style.display = "";
  }

  function allowPage() {
    document.body.style.display = "";
  }

  const currentPageId = getCurrentPageId();

  grantAccessFromUrl(currentPageId);

  document.addEventListener("DOMContentLoaded", function () {
    if (isAllowed(currentPageId)) {
      allowPage();
    } else {
      blockPage();
    }
  });
})();
``

