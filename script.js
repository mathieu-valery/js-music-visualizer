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
    barHeight = dataArray[i];
    ctx.fillStyle = 'white';
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth;
    }
  myReq = requestAnimationFrame(() => drawBars(dataArray, bufferLength, analyser));
  shouldCancelNextAnimation = true;
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
      shouldCancelNextAnimation = true;
}

function drawCircle(dataArray, bufferLength, analyser) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  analyser.getByteTimeDomainData(dataArray);
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  for (let i=0; i < bufferLength; i++) {
      const v = dataArray[i] * 2.5;
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
  myReq = requestAnimationFrame(() => drawCircle(dataArray, bufferLength, analyser));
  shouldCancelNextAnimation = true;
}

function animate(dataArray, bufferLength, analyser) {
  const select = document.getElementById('visualizer-select');
  switch(select.value) {
    case 'bars':
      drawBars(dataArray, bufferLength, analyser);
      break;
    case 'waveform':
      drawWaveForm(dataArray, bufferLength, analyser);
      break;
    case 'circle':
      drawCircle(dataArray, bufferLength, analyser);
      break;
    default:
      break;

  }
}

file.addEventListener('change', function() {
  const files = file.files;
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
})

select.addEventListener('change', function() {
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
})
