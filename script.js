const instruction = document.getElementById('instruction');
const scanner = document.getElementById('scanner');
const scanLine = document.getElementById('scan-line');
const countdown = document.getElementById('countdown');
const countdownNumber = document.querySelector('.countdown-number');
const video = document.getElementById('launchVideo');
const sound = document.getElementById('scanSound');

let isScanning = false;

document.body.addEventListener('touchstart', startScan);
document.body.addEventListener('click', startScan);

function startScan() {
  if (isScanning) return;
  isScanning = true;

  instruction.style.display = 'none';
  scanner.style.display = 'block';
  sound.play();

  setTimeout(() => {
    scanner.style.display = 'none';
    startCountdown();
  }, 4000); // durasi scanning 4 detik
}

function startCountdown() {
  countdown.style.display = 'flex';
  let count = 5;
  
  const countInterval = setInterval(() => {
    countdownNumber.style.animation = 'none';
    setTimeout(() => {
      countdownNumber.style.animation = 'countdownPulse 1s ease-in-out';
    }, 10);
    
    count--;
    if (count > 0) {
      countdownNumber.textContent = count;
    } else {
      clearInterval(countInterval);
      countdown.style.display = 'none';
      playVideo();
    }
  }, 1000);
}

function playVideo() {
  video.style.display = 'block';
  video.play();
  video.requestFullscreen?.();
  video.onended = () => {
    // bisa reload ulang untuk siap ke pengunjung berikutnya
    location.reload();
  };
}