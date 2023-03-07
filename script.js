const file = document.getElementById('fileupload');

const audio1 = document.getElementById('audio1');
const canvas = document.getElementById('canvas1');
canvas.width = window.innerHeight;
canvas.height = window.innerWidth;
const ctx = canvas.getContext('2d');
const select = document.getElementById('visualizer-select');

let audioSource;
let shouldCancelNextAnimation = false;

function drawBars(dataArray, bufferLength, analyser) {
  const barWidth = canvas.width/bufferLength;
  let barHeight;
  let x;
  x = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  analyser.getByteFrequencyData(dataArray);
  for (let i=0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 3;
    ctx.fillStyle = 'white';
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth;
    }
  myReq = requestAnimationFrame(() => drawBars(dataArray, bufferLength, analyser));
}

function drawWaveForm(dataArray, bufferLength, analyser) {
      let x;
      x = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      ctx.fillRect(0,0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      analyser.getByteTimeDomainData(dataArray);
      const sliceWidth = canvas.width / bufferLength;
      for (let i=0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * (canvas.height / 2);

          if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      myReq = requestAnimationFrame(() => drawWaveForm(dataArray, bufferLength, analyser));
}

function drawCircle(dataArray, bufferLength, analyser, amplification) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  analyser.getByteTimeDomainData(dataArray);
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  for (let i=0; i < bufferLength; i++) {
      const v = dataArray[i] * amplification;
      const y = Math.sin((((i / bufferLength) * 360) * Math.PI) / 180) * v;
      const x = Math.cos((((i / bufferLength) * 360) * Math.PI) / 180) * v;

      if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
  }
  ctx.restore();
  ctx.stroke();
  myReq = requestAnimationFrame(() => drawCircle(dataArray, bufferLength, analyser, amplification));
}

function resizeCanvasToFullScreen() {
  canvas.width = window.innerHeight;
  canvas.height = window.innerHeight;
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.position = 'absolute'
}

function resizeCanvas(width, height) {
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = 'auto'
  canvas.style.height = 'auto'
  canvas.style.position = 'relative'
}

function animate(dataArray, bufferLength, analyser) {
  shouldCancelNextAnimation = true;
  switch(select.value) {
    case 'bars':
      resizeCanvasToFullScreen()
      drawBars(dataArray, bufferLength, analyser);
      break;
    case 'waveform':
      resizeCanvasToFullScreen()
      drawWaveForm(dataArray, bufferLength, analyser);
      break;
    case 'circle':
      resizeCanvas(600,600);
      drawCircle(dataArray, bufferLength, analyser, 1.2);
      break;
    case 'ellipse':
      resizeCanvasToFullScreen()
      drawCircle(dataArray, bufferLength, analyser, 1.8);
      break;
    default:
      break;
  }
}

function loadFile() {
  const files = file.files;
  if (files.length === 0) return
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  audio1.src = URL.createObjectURL(files[0]);
  audio1.load();
  audio1.play();
  if (!audioSource) {
    audioSource = audioContext.createMediaElementSource(audio1);
    analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fft = 64;
  }
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  if (shouldCancelNextAnimation) cancelAnimationFrame(myReq)
  animate(dataArray, bufferLength, analyser);
}

file.addEventListener('change', () => loadFile())
select.addEventListener('change', () => loadFile())