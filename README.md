# 🐱 Cat Gatekeeper

**A fun and effective Chrome browser extension that helps you fight procrastination and doomscrolling.**

When you spend too much time on social media, a giant cute ginger cat appears on your screen and won't let you continue until your break time is over.
![Cat Gatekeeper Demo]( https://chromewebstore.google.com/detail/cat-gatekeeper/elbikiflgfhjdjmficnigpeegjbhdidh)


## ✨ Features

- **Configurable usage limits** — Set how many minutes you can use social media before the cat appears.
- **Break timer** — After the limit, enjoy a mandatory cute cat break.
- **Supported platforms**:
  - X (Twitter)
  - YouTube
  - Facebook
  - Reddit
  - Threads
  - Bluesky
- **Adorable cat animation** — A sliding ginger cat video + sleeping loop.
- **Popup settings** — Easy configuration directly from the extension icon.
- **Smart tracking** — Only counts active time on the page (pauses when tab is inactive).

## 📥 Installation

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **"Load unpacked"** and select the folder containing `manifest.json`.
5. The extension is now active! Click the cat icon in the toolbar to configure settings.

## 🔧 Configuration

- **Usage Limit**: Minutes of scrolling before the cat intervenes (default: 60).
- **Break Time**: How long the cat stays (default: 5 minutes).
- **Target Sites**: Toggle which social media sites are monitored.

## 🛠️ Tech Stack

- **Manifest V3**
- JavaScript
- HTML/CSS
- Video overlays (WebM)

## 📁 Project Structure
Cat-Gatekeeper/
├── manifest.json
├── popup.html          # Settings UI
├── popup.js
├── content.js          # Main logic + cat overlay
├── content.css
├── _locales/           # Translations
├── assets/             # Icons and cat videos
├── LICENSE
└── README.md


## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 🎯 Inspired by

The viral "Cat Gatekeeper" concept — using the irresistible power of cats to help you regain control of your attention.

---

**Made with ❤️ for people who want to scroll less and live more.**
