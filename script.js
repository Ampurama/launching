const instruction = document.getElementById('instruction');
const scanner = document.getElementById('scanner');
const scanLine = document.getElementById('scan-line');
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
    playVideo();
  }, 4000); // durasi scanning 4 detik
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