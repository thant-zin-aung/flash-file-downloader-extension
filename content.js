// Top-level cache
let cachedFormats = null;
let cachedVideoId = null;

if (window.flashDownloaderInitialized) {
  console.log("Flash Downloader already initialized");
} else {
  window.flashDownloaderInitialized = true;
  console.log("Flash Downloader content.js loaded");

  let lastVideoId = null;

  function getCurrentVideoId() {
    return new URLSearchParams(window.location.search).get("v");
  }

  // --- NEW: keeps one popup and swaps its content ---
  function openFormatsPopupSkeleton(mode = "loading") {
    const existing = document.getElementById("flash-downloader-format-wrapper");
    if (existing) existing.remove();

    const wrapper = document.createElement("div");
    wrapper.id = "flash-downloader-format-wrapper";
    wrapper.style.position = "fixed";
    wrapper.style.top = "50%";
    wrapper.style.left = "50%";
    wrapper.style.transform = "translate(-50%, -50%)";
    wrapper.style.zIndex = "10000";
    wrapper.style.userSelect = "none";

    const popup = document.createElement("div");
    popup.id = "flash-downloader-format-popup";
    popup.style.width = mode === "loading" ? "300px" : "90vw";
    popup.style.maxWidth = mode === "loading" ? "300px" : "700px";
    popup.style.maxHeight = "70vh";
    popup.style.overflowY = "auto";
    popup.style.backgroundColor = "rgba(30, 30, 30, 0.85)";
    popup.style.backdropFilter = "blur(10px)";
    popup.style.border = "1px solid rgba(67, 126, 251, 0.6)";
    popup.style.borderRadius = "12px";
    popup.style.boxShadow = "0 8px 30px rgba(67, 126, 251, 0.3)";
    popup.style.padding = "24px";
    popup.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    popup.style.color = "#e0e0e0";
    popup.style.cursor = "default";
    popup.style.transition = "width 0.3s ease, max-width 0.3s ease";

    wrapper.appendChild(popup);
    document.body.appendChild(wrapper);

    // Drag logic (unchanged)
    let isDragging = false,
      offsetX = 0,
      offsetY = 0;
    popup.addEventListener("mousedown", (e) => {
      if (e.target.closest(".format-card") || e.target.tagName === "BUTTON")
        return;
      isDragging = true;
      const rect = wrapper.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      wrapper.style.transition = "none";
      wrapper.style.transform = "none";
      wrapper.style.left = `${rect.left}px`;
      wrapper.style.top = `${rect.top}px`;
    });
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      wrapper.style.left = `${e.clientX - offsetX}px`;
      wrapper.style.top = `${e.clientY - offsetY}px`;
    });
    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    return { wrapper, popup };
  }

  function renderLoading(popup) {
    popup.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = "Fetching available formats...";
    title.style.color = "#437efb";
    title.style.margin = "0 0 20px";
    title.style.textAlign = "center";
    popup.appendChild(title);

    const spinner = document.createElement("div");
    spinner.style.border = "5px solid #333";
    spinner.style.borderTop = "5px solid #437efb";
    spinner.style.borderRadius = "50%";
    spinner.style.width = "40px";
    spinner.style.height = "40px";
    spinner.style.margin = "0 auto 20px";
    spinner.style.animation = "spin 1s linear infinite";
    popup.appendChild(spinner);

    const style = document.createElement("style");
    style.textContent = `
    @keyframes spin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
  `;
    document.head.appendChild(style);

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.padding = "10px 20px";
    cancelBtn.style.backgroundColor = "transparent";
    cancelBtn.style.border = "1px solid #437efb";
    cancelBtn.style.color = "#437efb";
    cancelBtn.style.borderRadius = "6px";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.style.display = "block";
    cancelBtn.style.margin = "0 auto";
    cancelBtn.addEventListener("mouseover", () => {
      cancelBtn.style.backgroundColor = "#437efb";
      cancelBtn.style.color = "#fff";
    });
    cancelBtn.addEventListener("mouseout", () => {
      cancelBtn.style.backgroundColor = "transparent";
      cancelBtn.style.color = "#437efb";
    });
    cancelBtn.addEventListener("click", () => {
      document.getElementById("flash-downloader-format-wrapper")?.remove();
    });

    popup.appendChild(cancelBtn);
  }

  function renderFormats(popup, wrapper, formats, videoId) {
    popup.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = "Select Format to Download";
    title.style.color = "#437efb";
    title.style.margin = "0 0 20px";
    title.style.textAlign = "center";
    popup.appendChild(title);

    const formatGrid = document.createElement("div");
    formatGrid.style.display = "flex";
    formatGrid.style.flexWrap = "wrap";
    formatGrid.style.gap = "12px";
    formatGrid.style.justifyContent = "center";

    formats.forEach((format) => {
      const card = document.createElement("div");
      card.className = "format-card";
      card.style.background = "rgba(50, 50, 50, 0.6)";
      card.style.border = "1px solid rgba(67, 126, 251, 0.4)";
      card.style.borderRadius = "8px";
      card.style.padding = "12px";
      card.style.width = "150px";
      card.style.cursor = "pointer";
      card.style.transition = "transform 0.2s";
      card.style.boxShadow = "0 2px 8px rgba(67, 126, 251, 0.15)";
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.alignItems = "center";
      card.style.color = "#cfd8ff";

      card.addEventListener("mouseover", () => {
        card.style.background = "rgba(67, 126, 251, 0.15)";
        card.style.borderColor = "#437efb";
        card.style.boxShadow = "0 4px 15px rgba(67, 126, 251, 0.35)";
        card.style.transform = "scale(1.05)";
      });
      card.addEventListener("mouseout", () => {
        card.style.background = "rgba(50, 50, 50, 0.6)";
        card.style.border = "1px solid rgba(67, 126, 251, 0.4)";
        card.style.boxShadow = "0 2px 8px rgba(67, 126, 251, 0.15)";
        card.style.transform = "scale(1)";
      });

      card.addEventListener("click", () => {
        chrome.runtime.sendMessage({
          action: "download",
          videoId: videoId,
          formatId: format.id,
        });
        wrapper.remove();
      });

      const res = document.createElement("div");
      res.textContent = format.resolution || "Unknown";
      res.style.fontSize = "16px";
      res.style.color = "#437efb";
      res.style.fontWeight = "bold";
      res.style.marginBottom = "6px";

      const type = document.createElement("div");
      type.textContent = format.type;
      type.style.fontSize = "14px";
      type.style.color = "#ccc";

      const size = document.createElement("div");
      size.textContent = format.size || "N/A";
      size.style.fontSize = "13px";
      size.style.color = "#aaa";
      size.style.marginTop = "4px";

      card.appendChild(res);
      card.appendChild(type);
      card.appendChild(size);
      formatGrid.appendChild(card);
    });

    popup.appendChild(formatGrid);

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.marginTop = "20px";
    cancelBtn.style.padding = "10px 20px";
    cancelBtn.style.backgroundColor = "transparent";
    cancelBtn.style.border = "1px solid #437efb";
    cancelBtn.style.color = "#437efb";
    cancelBtn.style.borderRadius = "6px";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.style.display = "block";
    cancelBtn.style.marginLeft = "auto";
    cancelBtn.style.marginRight = "auto";
    cancelBtn.style.transition = "background-color 0.3s, color 0.3s";

    cancelBtn.addEventListener("mouseover", () => {
      cancelBtn.style.backgroundColor = "#437efb";
      cancelBtn.style.color = "#fff";
    });
    cancelBtn.addEventListener("mouseout", () => {
      cancelBtn.style.backgroundColor = "transparent";
      cancelBtn.style.color = "#437efb";
    });
    cancelBtn.addEventListener("click", () => wrapper.remove());

    popup.appendChild(cancelBtn);
  }

  function createDownloadButton(videoId) {
    const player = document.querySelector(".html5-video-player");
    if (!player || document.getElementById("flash-downloader-btn-wrapper"))
      return;

    const wrapper = document.createElement("div");
    wrapper.id = "flash-downloader-btn-wrapper";
    wrapper.style.position = "absolute";
    wrapper.style.top = "0";
    wrapper.style.left = "0";
    wrapper.style.zIndex = "9999";
    wrapper.style.display = "inline-flex";
    wrapper.style.alignItems = "center";
    wrapper.style.backgroundColor = "rgb(33 93 134)";
    wrapper.style.borderRadius = "0 0 10px 0";
    wrapper.style.padding = "6px 10px";
    wrapper.style.fontWeight = "bold";

    const btn = document.createElement("button");
    btn.id = "flash-downloader-btn";
    btn.dataset.videoId = videoId;
    btn.textContent = "⬇ Download This Video";
    btn.style.background = "none";
    btn.style.border = "none";
    btn.style.color = "white";
    btn.style.fontWeight = "bold";
    btn.style.cursor = "pointer";
    btn.style.padding = "0";
    btn.style.marginRight = "10px";
    btn.style.fontSize = "11px";

    btn.addEventListener("click", async () => {
      const currentId = getCurrentVideoId();
      if (!currentId) {
        alert("No video ID found.");
        return;
      }

      const { wrapper, popup } = openFormatsPopupSkeleton("loading");
      renderLoading(popup);

      let formats = [];
      try {
        if (cachedFormats && cachedVideoId === currentId) {
          formats = cachedFormats;
          console.log("Using cached formats for video:", currentId);
        } else {
          const res = await fetch(
            `http://localhost:12345/formats?url=${encodeURIComponent(
              `https://www.youtube.com/watch?v=${currentId}`
            )}`
          );
          formats = await res.json();
          cachedFormats = formats;
          cachedVideoId = currentId;
          console.log("Fetched and cached new formats for video:", currentId);
        }

        popup.style.width = "90vw";
        popup.style.maxWidth = "700px";
        renderFormats(popup, wrapper, formats, currentId);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch formats. Is Flash File Downloader app running?");
        wrapper.remove();
      }
    });

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.title = "Close";
    closeBtn.style.background = "transparent";
    closeBtn.style.border = "none";
    closeBtn.style.color = "white";
    closeBtn.style.fontSize = "22px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.padding = "0";
    closeBtn.style.margin = "0";

    closeBtn.addEventListener("click", () => {
      wrapper.remove();
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(closeBtn);
    player.appendChild(wrapper);

    document.addEventListener("fullscreenchange", () => {
      const isFullscreen = !!document.fullscreenElement;
      wrapper.style.display = isFullscreen ? "none" : "inline-flex";
    });
  }

  function injectButtonIfNeeded() {
    const currentId = getCurrentVideoId();
    if (!currentId || currentId === lastVideoId) return;
    lastVideoId = currentId;
    cachedFormats = null;
    cachedVideoId = null;

    const oldWrapper = document.getElementById("flash-downloader-btn-wrapper");
    if (oldWrapper) oldWrapper.remove();

    const checkExist = setInterval(() => {
      const player = document.querySelector(".html5-video-player");
      if (player) {
        clearInterval(checkExist);
        createDownloadButton(currentId);
      }
    }, 500);
  }

  let currentUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      injectButtonIfNeeded();
    }
  });
  urlObserver.observe(document.body, { childList: true, subtree: true });

  injectButtonIfNeeded();
}
