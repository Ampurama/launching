const instruction = document.getElementById('instruction');
const scanner = document.getElementById('scanner');
const countdown = document.getElementById('countdown');
const countdownNumber = document.querySelector('.countdown-number');
const initialVideo = document.getElementById('initialVideo');
const video = document.getElementById('launchVideo');
const sound = document.getElementById('scanSound');

let isScanning = false;
let initialVideoPlayed = false;
let canStartScan = false;
let userHasInteracted = false;

// Detect Chrome
const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

// Show interactive overlay for Chrome
function showInteractiveOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'interactive-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    cursor: pointer;
  `;
  
  overlay.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: clamp(2rem, 6vw, 4rem); color: #00ffff; font-weight: 900; text-shadow: 0 0 30px #00ffff; margin-bottom: 20px; animation: pulse 2s infinite;">
        TAP ANYWHERE
      </div>
      <div style="font-size: clamp(1rem, 3vw, 1.5rem); color: #00ffff; opacity: 0.7; letter-spacing: 5px;">
        TO START EXPERIENCE
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  const startExperience = async (e) => {
    e.preventDefault();
    userHasInteracted = true;
    
    // Enter fullscreen first
    await enterFullscreen(document.documentElement);
    
    overlay.remove();
    
    // Now play with sound
    await playInitialVideoWithSound();
  };
  
  overlay.addEventListener('click', startExperience, { once: true });
  overlay.addEventListener('touchstart', startExperience, { once: true });
}

// Try autoplay on load
window.addEventListener('load', () => {
  setTimeout(() => {
    if (isChrome) {
      // Chrome: show overlay first
      showInteractiveOverlay();
    } else {
      // Safari/other: try autoplay
      tryAutoplay();
    }
  }, 300);
});

async function tryAutoplay() {
  try {
    // Enter fullscreen first
    await enterFullscreen(document.documentElement);
    
    instruction.style.display = 'none';
    initialVideo.style.display = 'block';
    document.body.classList.add('video-playing');
    
    // Start muted for autoplay policy
    initialVideo.muted = true;
    await initialVideo.play();
    
    console.log('Autoplay started (muted)');
    
    // Try to unmute
    setTimeout(() => {
      initialVideo.muted = false;
      initialVideo.volume = 1;
    }, 100);
    
  } catch (err) {
    console.log('Autoplay failed:', err);
    showInteractiveOverlay();
  }
}

async function playInitialVideoWithSound() {
  try {
    instruction.style.display = 'none';
    initialVideo.style.display = 'block';
    document.body.classList.add('video-playing');
    
    // Play with sound
    initialVideo.muted = false;
    initialVideo.volume = 1;
    await initialVideo.play();
    
    console.log('Video playing with sound');
    
  } catch (err) {
    console.error('Play error:', err);
    // Fallback to muted
    initialVideo.muted = true;
    await initialVideo.play();
  }
}

async function enterFullscreen(element) {
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen();
    } else if (element.webkitEnterFullscreen) {
      element.webkitEnterFullscreen();
    } else if (element.mozRequestFullScreen) {
      await element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      await element.msRequestFullscreen();
    }
    console.log('Fullscreen entered');
  } catch (err) {
    console.log('Fullscreen error:', err);
  }
}

async function exitFullscreen() {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      await document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      await document.msExitFullscreen();
    }
  } catch (err) {
    console.log('Exit fullscreen error:', err);
  }
}

initialVideo.addEventListener('ended', async () => {
  console.log('Initial video ended');
  initialVideo.style.display = 'none';
  document.body.classList.remove('video-playing');
  initialVideoPlayed = true;
  canStartScan = true;
  
  // Stay in fullscreen, just show instruction overlay
  instruction.innerHTML = `
    <div class="glitch" data-text="TEMPELKAN TANGAN ANDA">TEMPELKAN TANGAN ANDA</div>
    <div class="subtitle">UNTUK MEMULAI PELUNCURAN</div>
  `;
  instruction.style.display = 'block';
  
  // Enable clicking anywhere
  document.body.addEventListener('click', handleScanClick);
  document.body.addEventListener('touchstart', handleScanClick);
});

async function handleScanClick(e) {
  if (!canStartScan || isScanning) return;
  
  e.preventDefault();
  isScanning = true;
  canStartScan = false;
  
  // Remove listeners
  document.body.removeEventListener('click', handleScanClick);
  document.body.removeEventListener('touchstart', handleScanClick);
  
  // Already in fullscreen, just start scan
  startScan();
}

async function startScan() {
  instruction.style.display = 'none';
  scanner.style.display = 'block';
  
  // Play scan sound
  sound.play().catch(err => console.log('Sound error:', err));
  
  // Make scanner clickable during scan
  scanner.style.pointerEvents = 'auto';
  scanner.style.cursor = 'pointer';
  
  // Allow click during scanning to skip
  const skipScan = () => {
    scanner.removeEventListener('click', skipScan);
    scanner.removeEventListener('touchstart', skipScan);
    completeScan();
  };
  
  scanner.addEventListener('click', skipScan);
  scanner.addEventListener('touchstart', skipScan);
  
  // Auto complete after 4 seconds
  setTimeout(() => {
    scanner.removeEventListener('click', skipScan);
    scanner.removeEventListener('touchstart', skipScan);
    completeScan();
  }, 4000);
}

function completeScan() {
  scanner.style.display = 'none';
  startCountdown();
}

function startCountdown() {
  countdown.style.display = 'flex';
  let count = 5;
  countdownNumber.textContent = count;
  
  const countInterval = setInterval(() => {
    count--;
    
    if (count > 0) {
      countdownNumber.textContent = count;
      countdownNumber.style.animation = 'none';
      setTimeout(() => {
        countdownNumber.style.animation = 'countdownPulse 1s ease-in-out';
      }, 10);
    } else {
      clearInterval(countInterval);
      countdown.style.display = 'none';
      playLaunchVideo();
    }
  }, 1000);
}

async function playLaunchVideo() {
  document.body.classList.add('video-playing');
  video.style.display = 'block';
  video.volume = 1;
  
  try {
    await video.play();
    console.log('Launch video playing');
    
  } catch (err) {
    console.error('Launch video play failed:', err);
  }
}

video.addEventListener('ended', async () => {
  console.log('Launch video ended');
  video.style.display = 'none';
  document.body.classList.remove('video-playing');
  
  // Exit fullscreen
  await exitFullscreen();
  
  // Reload page
  setTimeout(() => {
    location.reload();
  }, 1000);
});

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
`;
document.head.appendChild(style);