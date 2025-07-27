# ⚡ Flash File YouTube Downloader Extension

A lightweight, modern, and elegant Chrome Extension that adds a **"⬇ Download This Video"** button directly on YouTube — allowing users to download videos or audio in the format of their choice.

<br>

## ✨ Features

- 🎯 **Smart format detection** using `yt-dlp` backend
- 🎬 **“Download This Video”** button injected dynamically into YouTube player
- 🌑 **Modern dark-themed popup** with responsive design
- 🧱 **Grid layout of formats** showing resolution, size, and type (video/audio)
- 🎯 **Popup centered** over the YouTube video player
- ✋ **Draggable popup** (click anywhere except format boxes)
- 💾 **Caches formats per video** to avoid unnecessary re-fetches
- 🔁 **Supports SPA navigation** (YouTube’s dynamic page transitions)
- 🎥 **Auto-hide in fullscreen** video mode for clean UI
- ⏳ **Loading animation** with cancel option while fetching formats


<br>

## 📦 Project Structure
```
flash-file-downloader-extension/
├── manifest.json
├── background.js
├── content.js
├── popup.html (optional)
├── icons/
│ └── icon128.png
├── README.md
```

<br>

## 🧠 How It Works

- When a YouTube video page is loaded, `content.js` injects a **Download button** onto the player.
- Clicking the button fetches available formats from a local server (your Flash Downloader backend).
- A draggable popup appears centered on the video player, showing a grid of format options.
- Users can select their desired format or cancel the popup anytime.

<br>

## 🔧 Requirements

### Chrome Extension

- Google Chrome browser
- Developer Mode enabled to load the unpacked extension

### Backend (Required)

You need to run your Java/Spring-based backend server (`Flash File Downloader`) locally which handles `yt-dlp` and FFmpeg processing.

Example API request from extension:
```
GET http://localhost:12345/formats?url=https://www.youtube.com/watch?v=VIDEO_ID
```


> 🔒 Make sure `yt-dlp` is installed and accessible by your backend.

<br>

## 🚀 Installation

### 1. Load Extension in Chrome

1. Go to `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select your `flash-file-downloader-extension` directory

### 2. Run Your Backend

Make sure your Flash File Downloader backend (Java Spring App or Simple Http Server) is running on `http://localhost:12345`.

<br>

## 🎨 Customization

- Modify `content.js` for UI design updates
- Update dark theme colors via inline styles (`#1e1e1e`, `#437efb`)
- Change popup positioning or animation easily

<br>

## 📃 License

MIT License  
Copyright (c) 2025

---

Built with ❤️ by Thant Zin Aung 

