const CAT_VIDEO_URL = chrome.runtime.getURL('assets/neko1.webm');
const CAT_SLEEP_URL = chrome.runtime.getURL('assets/neko2.webm');

// Preload videos to ensure smooth playback when needed
const preloadVideo = document.createElement('video');
preloadVideo.src = CAT_VIDEO_URL;
preloadVideo.preload = 'auto';
preloadVideo.muted = true;

const preloadSleep = document.createElement('video');
preloadSleep.src = CAT_SLEEP_URL;
preloadSleep.preload = 'auto';
preloadSleep.muted = true;

const preventScroll = (e) => e.preventDefault();

const SITE_MAP = {
  'twitter.com': 'x',
  'x.com': 'x',
  'facebook.com': 'facebook',
  'reddit.com': 'reddit',
  'youtube.com': 'youtube',
  'threads.com': 'threads',
  'threads.net': 'threads',
  'bsky.app': 'bluesky',
};

const hostname = location.hostname;
const siteKey = Object.entries(SITE_MAP).find(([d]) => hostname.includes(d))?.[1];

function mergeSettingsWithDefaults(settings) {
  return {
    usageLimit: settings.usageLimit ?? 60,
    breakTime: settings.breakTime ?? 5,
    sns: {
      x: true,
      facebook: true,
      reddit: true,
      youtube: true,
      threads: true,
      bluesky: true,
      ...(settings.sns || {}),
    },
  };
}

if (siteKey) {
  chrome.storage.local.get({
    sns: { x: true, facebook: true, reddit: true, youtube: true, threads: true, bluesky: true },
    usageLimit: 60,
    breakTime: 5,
  }, (settings) => {
    const mergedSettings = mergeSettingsWithDefaults(settings);

    if (!mergedSettings.sns[siteKey]) return;
    startTracking(mergedSettings.usageLimit, mergedSettings.breakTime);
  });
}

let catIsActive = false;
let trackerRunning = false;

// Receive messages from the popup or background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_CAT_STATUS') {
    sendResponse({
      catIsActive,
      siteKey,
      hostname,
      trackerRunning,
      hasFocus: document.hasFocus(),
      isHidden: document.hidden,
    });
    return;
  }

  if (message.type === 'UPDATE_SETTINGS' && siteKey) {
    const { settings } = message;
    currentUsageLimit = settings.usageLimit;
    currentBreakTime = settings.breakTime;
    currentSnsEnabled = !!settings.sns[siteKey];
    if (!currentSnsEnabled) {
      stopTracker();
      return;
    }
    if (!catIsActive) {
      startTracking(settings.usageLimit, settings.breakTime);
    }
  }

  if (message.type === 'DISMISS_CAT') {
    const overlay = document.getElementById('cat-gatekeeper-overlay');
    if (!overlay) return;
    catIsActive = false;
    stopCountdown();
    overlay.style.transition = 'opacity 0.5s';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      document.documentElement.style.overflow = '';
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
      if (currentSnsEnabled) startTracking(currentUsageLimit, currentBreakTime);
    }, 500);
  }
});

let resetSeconds = () => {};
let stopTracker = () => {};
let stopCountdown = () => {};
let currentUsageLimit = 60;
let currentBreakTime = 5;
let currentSnsEnabled = true;

// Reset when switching tabs (register only once) 
document.addEventListener('visibilitychange', () => {
  if (document.hidden) resetSeconds();
});

function startTracking(usageLimit, breakTime) {
  stopTracker();
  currentUsageLimit = usageLimit;
  currentBreakTime = breakTime;
  trackerRunning = true;
  let localSeconds = 0;

  resetSeconds = () => { localSeconds = 0; };

  const tracker = setInterval(() => {
    if (document.hidden || !document.hasFocus()) return;
    localSeconds++;

    if (localSeconds >= usageLimit * 60) {
      clearInterval(tracker);
      trackerRunning = false;
      catIsActive = true;
      showCat(breakTime, usageLimit, () => {
        if (currentSnsEnabled) startTracking(currentUsageLimit, currentBreakTime);
      });
    }
  }, 1000);

  stopTracker = () => {
    trackerRunning = false;
    clearInterval(tracker);
  };
}

function showCat(breakMinutes, usageLimit, onBreakEnd) {
  const overlay = document.createElement('div');
  overlay.id = 'cat-gatekeeper-overlay';

// Countdown

  const countdown = document.createElement('div');
  countdown.id = 'cat-gatekeeper-countdown';
  let seconds = breakMinutes * 60;

  let countdownCancelled = false;
  stopCountdown = () => { countdownCancelled = true; };

  function updateCountdown() {
    if (countdownCancelled) return;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    countdown.textContent = `${m}:${String(s).padStart(2, '0')}`;
    if (seconds > 0) {
      seconds--;
      setTimeout(updateCountdown, 1000);
    } else {
      catIsActive = false;
      overlay.style.transition = 'opacity 1s';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        document.documentElement.style.overflow = '';
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
        onBreakEnd();
      }, 1000);
    }
  }
  updateCountdown();

  // neko1
  const video = document.createElement('video');
  video.src = CAT_VIDEO_URL;
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;

  // neko2 (pre-read / hidden)
  const videoSleep = document.createElement('video');
  videoSleep.src = CAT_SLEEP_URL;
  videoSleep.muted = true;
  videoSleep.playsInline = true;
  videoSleep.loop = true;
  videoSleep.style.display = 'none';

  overlay.appendChild(countdown);
  overlay.appendChild(video);
  overlay.appendChild(videoSleep);
  document.body.appendChild(overlay);
  document.documentElement.style.overflow = 'hidden';
  document.addEventListener('wheel', preventScroll, { passive: false });
  document.addEventListener('touchmove', preventScroll, { passive: false });

  // Pause videos on the page (except cat videos)
  document.querySelectorAll('video').forEach(v => {
    if (v !== video && v !== videoSleep) v.pause();
  });

  // Switch to neko2 after neko1 is finished
  video.addEventListener('ended', () => {
    video.style.display = 'none';
    videoSleep.style.display = 'block';
    videoSleep.classList.add('sleeping');
    videoSleep.play();
  });
}
