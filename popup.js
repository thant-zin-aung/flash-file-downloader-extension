// popup.js
function getYouTubeVideoId(url) {
  const urlObj = new URL(url);
  return urlObj.searchParams.get("v");
}

function renderFormats(formats, videoId) {
  const container = document.getElementById("formats");
  container.innerHTML = "";

  formats.forEach((format) => {
    const div = document.createElement("div");
    div.className = "format";
    div.innerHTML = `
      <strong>${format.resolution}</strong> (${format.type}, ${format.size})<br/>
      <button>Download</button>
    `;

    div.querySelector("button").onclick = () => {
      chrome.runtime.sendMessage({
        action: "download",
        videoId: videoId,
        formatId: format.id,
      });
    };

    container.appendChild(div);
  });
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const url = tabs[0].url;
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    document.getElementById("formats").textContent = "Not a YouTube video.";
    return;
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  fetch(`http://localhost:12345/formats?url=${encodeURIComponent(videoUrl)}`)
    .then((res) => res.json())
    .then((data) => renderFormats(data, videoId))
    .catch((err) => {
      console.error("Failed to fetch formats:", err);
      document.getElementById("formats").textContent =
        "App not running or error fetching formats.";
    });
});
