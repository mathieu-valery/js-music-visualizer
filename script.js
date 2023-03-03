
const file = document.getElementById('fileupload');

const audio1 = document.getElementById('audio1');
const canvas = document.getElementById('canvas1');
// canvas.width = 400;
// canvas.height = 400;
canvas.width = window.innerHeight;
canvas.height = window.innerWidth;
const ctx = canvas.getContext('2d');

let audioSource;
let analyser;

// file.addEventListener('change', function() {
//     const files = this.files;
//     const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//     audio1.src = URL.createObjectURL(files[0]);
//     audio1.load();
//     audio1.play();
//     audioSource = audioContext.createMediaElementSource(audio1);
//     analyser = audioContext.createAnalyser();
//     audioSource.connect(analyser);
//     analyser.connect(audioContext.destination);
//     analyser.fft = 64;
//     const bufferLength = analyser.frequencyBinCount;
//     const dataArray = new Uint8Array(bufferLength);

//     const barWidth = canvas.width/bufferLength;
//     let barHeight;
//     let x;

//     function animate() {
//         x = 0;
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         analyser.getByteFrequencyData(dataArray);
//         for (let i=0; i < bufferLength; i++) {
//             barHeight = dataArray[i];
//             ctx.fillStyle = 'white';
//             ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
//             x += barWidth;
//         }
//         requestAnimationFrame(animate);

//     }
//     animate();
// })

file.addEventListener('change', function() {
        const files = this.files;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audio1.src = URL.createObjectURL(files[0]);
        audio1.load();
        audio1.play();
        audioSource = audioContext.createMediaElementSource(audio1);
        analyser = audioContext.createAnalyser();
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fft = 1024;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
    
        const barWidth = canvas.width/bufferLength;
        let barHeight;
        let x;
    
        function draw() {
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
            requestAnimationFrame(draw);
        }
        draw();
    })
