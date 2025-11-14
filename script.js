const instruction = document.getElementById('instruction');
const scanner = document.getElementById('scanner');
const countdown = document.getElementById('countdown');
const countdownNumber = document.querySelector('.countdown-number');
const initialVideo = document.getElementById('initialVideo');
const video = document.getElementById('launchVideo');
const secondAttemptVideo = document.getElementById('secondAttemptVideo');
const processVideo = document.getElementById('processVideo');
const sound = document.getElementById('scanSound');


let isScanning = false;
let initialVideoPlayed = false;
let canStartScan = false;
let userHasInteracted = false;
let currentStep = 0; // 0: blank, 1: video1, 2: scan, 3: countdown, 4: video2, 5: blank, 6: video3

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

// Start with blank black screen, wait for click/tap
window.addEventListener('load', () => {
  setTimeout(() => {
    // Ensure blank screen is visible - hide all elements
    instruction.style.display = 'none';
    scanner.style.display = 'none';
    countdown.style.display = 'none';
    initialVideo.style.display = 'none';
    video.style.display = 'none';
    secondAttemptVideo.style.display = 'none';
    processVideo.style.display = 'none';

    // Remove background animations for blank screen
    document.body.classList.add('blank-screen');

    // Show blank screen, wait for user interaction
    document.body.addEventListener('click', startExperience, { once: true });
    document.body.addEventListener('touchstart', startExperience, { once: true });
  }, 300);
});

function startExperience() {
  nextStep(); // Start with Video1
}

// Start the experience after initial video
initialVideo.addEventListener('ended', () => {
  // Do not call nextStep here, let the scan process handle it
});

// Function to handle step progression
function nextStep() {
  currentStep++;
  switch(currentStep) {
    case 1:
      playInitialVideo();
      break;
    case 2:
      startHandScan();
      break;
    case 3:
      startCountdown();
      break;
    case 4:
      playSecondAttemptVideo();
      break;
    case 5:
      showBlankScreen();
      break;
    case 6:
      playProcessVideo();
      break;
    case 7:
      endExperience();
      break;
  }
}

async function tryAutoplay() {
  try {
    // Enter fullscreen first
    await enterFullscreen(document.documentElement);

    playInitialVideo();

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

async function playInitialVideo() {
  try {
    instruction.style.display = 'none';
    initialVideo.style.display = 'block';
    document.body.classList.add('video-playing');

    // Play with sound
    initialVideo.muted = false;
    initialVideo.volume = 1;
    await initialVideo.play();

    console.log('Initial video playing');

  } catch (err) {
    console.error('Initial video play error:', err);
    // Fallback to muted
    initialVideo.muted = true;
    await initialVideo.play();
  }
}

function startHandScan() {
  console.log('Starting 3 simultaneous hand scans');

  instruction.style.display = 'none';

  // Create 3 scanners with better visual design
  for (let i = 1; i <= 3; i++) {
    const scannerElement = document.createElement('div');
    scannerElement.id = `scanner-${i}`;
    scannerElement.className = 'hand-scanner';
    scannerElement.innerHTML = `

      <div class="scan-beam"></div>
      <div class="scan-particles"></div>
    `;
    document.body.appendChild(scannerElement);

    // Position scanners horizontally
    scannerElement.style.position = 'absolute';
    scannerElement.style.left = `${(i - 1) * 33.33}%`;
    scannerElement.style.top = '50%';
    scannerElement.style.transform = 'translateY(-50%)';
    scannerElement.style.width = '33.33%';
    scannerElement.style.height = '100%';
    scannerElement.style.display = 'flex';
    scannerElement.style.flexDirection = 'column';
    scannerElement.style.alignItems = 'center';
    scannerElement.style.justifyContent = 'center';
    scannerElement.style.zIndex = '10';

    // Start scanning animation for each
    startIndividualScan(scannerElement, i);
  }

  // Play scan sound
  sound.play().catch(err => console.log('Sound error:', err));

  // All 3 scans complete after 4 seconds
  setTimeout(() => {
    // Remove all scanners
    for (let i = 1; i <= 3; i++) {
      const scannerElement = document.getElementById(`scanner-${i}`);
      if (scannerElement) {
        scannerElement.remove();
      }
    }
    nextStep(); // Proceed to countdown
  }, 4000);
}

function startIndividualScan(scannerElement, index) {
  const handIcon = scannerElement.querySelector('.hand-icon');
  const scanBeam = scannerElement.querySelector('.scan-beam');
  const scanParticles = scannerElement.querySelector('.scan-particles');

  // Animate hand icon
  handIcon.style.animation = 'handPulseScanning 1s ease-in-out infinite';

  // Animate scan beam
  scanBeam.style.animation = 'scanBeamAdvanced 4s ease-in-out forwards';

  // Add scanning grid overlay
  const gridOverlay = document.createElement('div');
  gridOverlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0, 255, 255, 0.1) 20px, rgba(0, 255, 255, 0.1) 21px),
      repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0, 255, 255, 0.1) 20px, rgba(0, 255, 255, 0.1) 21px);
    pointer-events: none;
    opacity: 0;
    animation: gridFadeIn 0.5s ease-out forwards;
  `;
  scannerElement.appendChild(gridOverlay);

  // Add vertical scan lines
  for (let i = 0; i < 5; i++) {
    const scanLine = document.createElement('div');
    scanLine.style.cssText = `
      position: absolute;
      top: 0;
      left: ${i * 20}%;
      width: 1px;
      height: 100%;
      background: linear-gradient(to bottom, transparent, rgba(0, 255, 255, 0.3), transparent);
      animation: verticalPulse ${2 + Math.random()}s ease-in-out infinite;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    scannerElement.appendChild(scanLine);
  }

  // Add data points particles
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = 3 + Math.random() * 5;
    const delay = Math.random() * 3;
    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: rgba(0, 255, 255, 0.9);
      border-radius: 50%;
      left: ${20 + Math.random() * 60}%;
      top: ${Math.random() * 100}%;
      box-shadow: 0 0 ${size * 2}px rgba(0, 255, 255, 1);
      animation: particleFloatAdvanced ${2 + Math.random() * 2}s ease-out forwards;
      animation-delay: ${delay}s;
      opacity: 0;
    `;
    scanParticles.appendChild(particle);
  }

  // Add circular scan effect
  const circularScan = document.createElement('div');
  circularScan.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0;
    height: 0;
    border: 2px solid rgba(0, 255, 255, 0.6);
    border-radius: 50%;
    animation: circularExpand 3s ease-out forwards;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.8), inset 0 0 20px rgba(0, 255, 255, 0.4);
  `;
  scannerElement.appendChild(circularScan);
}

// Add new animations to the style element
const scanAnimations = document.createElement('style');
scanAnimations.textContent = `
  @keyframes gridFadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes verticalPulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
  }

  @keyframes circularExpand {
    0% {
      width: 0;
      height: 0;
      opacity: 1;
    }
    100% {
      width: 300%;
      height: 300%;
      opacity: 0;
    }
  }
`;
document.head.appendChild(scanAnimations);

// Handle initial video end to show hand scanners directly
initialVideo.addEventListener('ended', () => {
  console.log('Initial video ended');
  initialVideo.style.display = 'none';
  document.body.classList.remove('video-playing');
  initialVideoPlayed = true;
  canStartScan = true;

  // Show hand scanners directly (static, clickable)
  showClickableHandScanners();
});

function showClickableHandScanners() {
  console.log('Showing clickable hand scanners');

  // Create 3 static, clickable hand scanners
  for (let i = 1; i <= 3; i++) {
    const scannerElement = document.createElement('div');
    scannerElement.id = `scanner-${i}`;
    scannerElement.className = 'hand-scanner clickable';
    scannerElement.innerHTML = `
      <div class="hand-icon">👋</div>
      <div class="scan-beam static"></div>
      <div class="scan-particles static"></div>
    `;
    document.body.appendChild(scannerElement);

    // Position scanners horizontally
    scannerElement.style.position = 'absolute';
    scannerElement.style.left = `${(i - 1) * 33.33}%`;
    scannerElement.style.top = '50%';
    scannerElement.style.transform = 'translateY(-50%)';
    scannerElement.style.width = '33.33%';
    scannerElement.style.height = '100%';
    scannerElement.style.display = 'flex';
    scannerElement.style.flexDirection = 'column';
    scannerElement.style.alignItems = 'center';
    scannerElement.style.justifyContent = 'center';
    scannerElement.style.zIndex = '10';
    scannerElement.style.cursor = 'pointer';

    // Add click listener to each scanner
    scannerElement.addEventListener('click', () => handleScannerClick(i));
    scannerElement.addEventListener('touchstart', () => handleScannerClick(i));
  }
}

function handleScannerClick(scannerIndex) {
  if (!canStartScan || isScanning) return;

  console.log(`Scanner ${scannerIndex} clicked, starting scan`);
  isScanning = true;
  canStartScan = false;

  // Remove all scanners
  for (let i = 1; i <= 3; i++) {
    const scannerElement = document.getElementById(`scanner-${i}`);
    if (scannerElement) {
      scannerElement.remove();
    }
  }

  // Start the animated hand scans
  startHandScan();
}

async function playSecondAttemptVideo() {
  scanner.style.display = 'none';
  secondAttemptVideo.style.display = 'block';
  document.body.classList.add('video-playing');
  secondAttemptVideo.volume = 1;

  try {
    await secondAttemptVideo.play();
    console.log('Second attempt video playing');
  } catch (err) {
    console.error('Second attempt video play failed:', err);
  }
}

function showBlankScreen() {
  secondAttemptVideo.style.display = 'none';
  document.body.classList.remove('video-playing');
  document.body.classList.add('blank-screen');
  // Show blank black screen, wait for click/tap
  console.log('Blank screen shown, waiting for click');
  document.body.addEventListener('click', handleBlankClick, { once: true });
  document.body.addEventListener('touchstart', handleBlankClick, { once: true });
}

function handleBlankClick() {
  document.body.classList.remove('blank-screen');
  nextStep();
}

async function playProcessVideo() {
  processVideo.style.display = 'block';
  document.body.classList.add('video-playing');
  processVideo.volume = 1;

  try {
    await processVideo.play();
    console.log('Process video playing');
  } catch (err) {
    console.error('Process video play failed:', err);
  }
}

function endExperience() {
  processVideo.style.display = 'none';
  document.body.classList.remove('video-playing');
  // Exit fullscreen and reload
  exitFullscreen().then(() => {
    setTimeout(() => {
      location.reload();
    }, 1000);
  });
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





// Add event listeners for videos
secondAttemptVideo.addEventListener('ended', () => {
  console.log('Second attempt video ended');
  nextStep(); // To blank screen
});

processVideo.addEventListener('ended', () => {
  console.log('Process video ended');
  nextStep(); // End experience
});



function startCountdown() {
  countdown.style.display = 'flex';
  let count = 3;
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
      nextStep(); // Proceed to video2
    }
  }, 1000);
}





// Add pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
`;
document.head.appendChild(style);
