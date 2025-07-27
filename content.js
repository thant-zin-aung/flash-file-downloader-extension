// Prevent multiple injections
if (window.flashDownloaderInitialized) {
  console.log("Flash Downloader already initialized");
} else {
  window.flashDownloaderInitialized = true;
  console.log("Flash Downloader content.js loaded");

  let lastVideoId = null;

  function getCurrentVideoId() {
    return new URLSearchParams(window.location.search).get("v");
  }

  function createDownloadButton(videoId) {
    const player = document.querySelector(".html5-video-player");
    if (!player || document.getElementById("flash-downloader-btn")) return;

    const btn = document.createElement("button");
    btn.id = "flash-downloader-btn";
    btn.dataset.videoId = videoId;
    btn.textContent = "⬇ Download This Video";
    btn.style.position = "absolute";
    btn.style.zIndex = "9999";
    btn.style.top = "80px";
    btn.style.right = "20px";
    btn.style.padding = "10px 16px";
    btn.style.backgroundColor = "#ff0000";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "6px";
    btn.style.fontWeight = "bold";
    btn.style.cursor = "pointer";

    btn.addEventListener("click", async () => {
      const currentId = getCurrentVideoId();
      if (!currentId) {
        alert("No video ID found.");
        return;
      }

      console.log("Button clicked, videoId:", currentId);

      let formats = [];
      try {
        const res = await fetch(
          `http://localhost:12345/formats?url=${encodeURIComponent(
            `https://www.youtube.com/watch?v=${currentId}`
          )}`
        );
        formats = await res.json();
      } catch (err) {
        alert("Failed to fetch formats. Is your Flash Downloader app running?");
        return;
      }

      showFormatPopup(formats, currentId);
    });

    player.appendChild(btn);
  }

  function showFormatPopup(formats, videoId) {
    const existingPopup = document.getElementById(
      "flash-downloader-format-popup"
    );
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement("div");
    popup.id = "flash-downloader-format-popup";
    popup.style.position = "fixed";
    popup.style.top = "100px";
    popup.style.right = "20px";
    popup.style.width = "300px";
    popup.style.maxHeight = "400px";
    popup.style.overflowY = "auto";
    popup.style.backgroundColor = "white";
    popup.style.border = "1px solid #ccc";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    popup.style.zIndex = "10000";
    popup.style.padding = "12px";
    popup.style.fontFamily = "Arial, sans-serif";

    const title = document.createElement("h4");
    title.textContent = "Select Format to Download";
    title.style.marginTop = "0";
    popup.appendChild(title);

    formats.forEach((format) => {
      const formatBtn = document.createElement("button");
      formatBtn.textContent = `${format.resolution} - ${format.type} (${format.size}) - ${format.id}`;
      formatBtn.style.display = "block";
      formatBtn.style.width = "100%";
      formatBtn.style.marginBottom = "6px";
      formatBtn.style.padding = "8px";
      formatBtn.style.cursor = "pointer";
      formatBtn.style.border = "1px solid #007bff";
      formatBtn.style.backgroundColor = "#e7f1ff";
      formatBtn.style.borderRadius = "4px";
      formatBtn.style.textAlign = "left";

      formatBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({
          action: "download",
          videoId: videoId,
          formatId: format.id,
        });
        popup.remove();
      });

      popup.appendChild(formatBtn);
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.marginTop = "10px";
    cancelBtn.style.padding = "8px 16px";
    cancelBtn.style.backgroundColor = "#ccc";
    cancelBtn.style.border = "none";
    cancelBtn.style.borderRadius = "4px";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.addEventListener("click", () => popup.remove());

    popup.appendChild(cancelBtn);
    document.body.appendChild(popup);
  }

  function injectButtonIfNeeded() {
    const currentId = getCurrentVideoId();

    if (!currentId || currentId === lastVideoId) return;

    lastVideoId = currentId;

    const oldBtn = document.getElementById("flash-downloader-btn");
    if (oldBtn) oldBtn.remove();

    const checkExist = setInterval(() => {
      const player = document.querySelector(".html5-video-player");
      if (player) {
        clearInterval(checkExist);
        createDownloadButton(currentId);
      }
    }, 500);
  }

  // Observe URL change in YouTube SPA
  let currentUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      injectButtonIfNeeded();
    }
  });
  urlObserver.observe(document.body, { childList: true, subtree: true });

  // Initial button injection
  injectButtonIfNeeded();
}
