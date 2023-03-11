const file = document.getElementById('fileupload');
const audio1 = document.getElementById('audio1');
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const select = document.getElementById('visualizer-select');
const particles = [];

let audioSource;
let shouldCancelNextAnimation = false;
let isPlaying = false;
let isPeaking = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (window.innerWidth < 1000 && select.value === 'circle') {
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
  }
  if (window.innerWidth > 1000 && select.value === 'circle') {
    canvas.width = window.innerWidth * 1.3;
    canvas.height = window.innerHeight * 1.3;
  }
}

resizeCanvas();

function drawBars(dataArray, bufferLength, analyser) {
  const barWidth = canvas.width/bufferLength;
  let barHeight;
  let x = 0;
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
      let x = 0;
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

  // Circle is 2 mirrored half-circle, otherwise its not possible to close smoothly a full circle
  for (let i=0; i < bufferLength; i++) {
      const v = dataArray[i] * amplification;
      const y = Math.sin((((i / (bufferLength -1)) * 180) * Math.PI) / 180) * v;
      const x = Math.cos((((i / (bufferLength -1)) * 180) * Math.PI) / 180) * v;

      if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
  }
  for (let i=0; i < bufferLength; i++) {
    const v = dataArray[i] * amplification;
    const y = - Math.sin((((i / (bufferLength -1)) * 180) * Math.PI) / 180) * v;
    const x = Math.cos((((i / (bufferLength -1)) * 180) * Math.PI) / 180) * v;

    if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
  }
  ctx.restore();
  ctx.stroke();

  const p = new Particle();
  if (isPlaying) particles.push(p);

  analyser.getByteFrequencyData(dataArray);
  let sum = 0
  const lowFrequencyBars = 12
  for(let i=0; i < lowFrequencyBars; i++) {
    sum = sum + dataArray[i]
  }
  const moy = sum / lowFrequencyBars;
  moy > 200 ? isPeaking = true : isPeaking = false;

  particles.forEach((particle, index) => {
    if(!particle.isOutbound()) {
      particle.draw()
      particle.update();
    } else {
      particles.splice(index, 1);
    }

  })
  myReq = requestAnimationFrame(() => drawCircle(dataArray, bufferLength, analyser, amplification));
}

function animate(dataArray, bufferLength, analyser) {
  shouldCancelNextAnimation = true;
  switch(select.value) {
    case 'bars':
      drawBars(dataArray, bufferLength, analyser);
      break;
    case 'waveform':
      drawWaveForm(dataArray, bufferLength, analyser);
      break;
    case 'circle':
      drawCircle(dataArray, bufferLength, analyser, 1.2);
      break;
    default:
      break;
  }
}

function randomRange(min, max) {
  let range = max - min + 1;
  return Math.floor( Math.random() * range ) + min
}

class Particle {
  constructor() {
    this.angle = (Math.random() * 360) * Math.PI / 180
    this.x = Math.cos(this.angle) * 250;
    this.y = Math.sin(this.angle) * 250;
    this.radius = 2;
    this.acc = randomRange(1,8);
  }

  draw() {
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.restore();
    ctx.stroke();
  }

  update() {
    this.x = this.x + Math.cos(this.angle) * this.acc;
    this.y = this.y + Math.sin(this.angle) * this.acc;
    if(isPeaking) {
      this.x = this.x + Math.cos(this.angle) *6;
      this.y = this.y + Math.sin(this.angle) *6;
    }
  }

  isOutbound() {
    if(this.x < -canvas.width / 2 || this.x > canvas.width / 2 ||
      this.y < -canvas.height /2 || this.y > canvas.height /2) {
      return true
    } else {
      return false
    }
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

file.addEventListener('change', () => loadFile());
select.addEventListener('change', () => {
  loadFile();
  resizeCanvas();
});
audio1.addEventListener('pause', () => isPlaying = false);
audio1.addEventListener('play', () => isPlaying = true);
addEventListener("resize", () => resizeCanvas());