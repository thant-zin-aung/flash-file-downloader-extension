console.log("Background script loaded");

// Inject content.js on YouTube SPA navigation changes
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.url.includes("https://www.youtube.com/watch")) {
    chrome.scripting
      .executeScript({
        target: { tabId: details.tabId },
        files: ["content.js"],
      })
      .then(() => {
        console.log("content.js injected on SPA navigation");
      })
      .catch((err) => {
        console.error("Failed to inject content.js:", err);
      });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getFormats") {
    const videoUrl = `https://www.youtube.com/watch?v=${message.videoId}`;
    console.log("Requesting formats for:", videoUrl);

    fetch(`http://localhost:12345/formats?url=${encodeURIComponent(videoUrl)}`)
      .then((res) => res.json())
      .then((formats) => {
        console.log("Received formats:", formats);
        sendResponse({ success: true, formats });
      })
      .catch((err) => {
        console.error("Failed to get formats from Flash Downloader app:", err);
        sendResponse({ success: false, error: err.toString() });
      });

    return true; // Required for async sendResponse
  }

  if (message.action === "download") {
    const { videoId, formatId } = message;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const apiUrl = `http://localhost:12345/download?url=${encodeURIComponent(
      videoUrl
    )}&formatId=${formatId}`;

    console.log(
      "Sending download request for:",
      videoUrl,
      "with formatId:",
      formatId
    );

    fetch(apiUrl)
      .then((res) => {
        console.log("Download triggered. Response status:", res.status);
        sendResponse({ success: true });
      })
      .catch((err) => {
        console.error("Failed to contact Flash Downloader app:", err);
        sendResponse({ success: false, error: err.toString() });
      });

    return true; // Allow async sendResponse
  }
});
