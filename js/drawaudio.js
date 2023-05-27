
// Set up audio context
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

/**
 * Retrieves audio from an external source, the initializes the drawing function
 * @param {String} url the url of the audio we'd like to fetch
 */
const drawAudio = (url, index, delay) => {
  fetch(url)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => draw(normalizeData(filterData(audioBuffer, delay)), index));
};

/**
 * Filters the AudioBuffer retrieved from an external source
 * @param {AudioBuffer} audioBuffer the AudioBuffer from drawAudio()
 * @returns {Array} an array of floating point numbers
 */
const filterData = (audioBuffer, delay) => {
  delayArray.push(delay*BEAT*60/BPM*1000);
  const ticksPerBeat = 8;
  const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
  console.log(audioBuffer);
  if (audioBuffer.sampleRate) {
    var sampleRate = audioBuffer.sampleRate;
  } else {
    var sampleRate = 48000;
  }
  //const samples = 1400; // Number of samples we want to have in our final data set
  const samples = rawData.length * ticksPerBeat * BPM / 60 / sampleRate; // Number of samples we want to have in our final data set
  const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
  const filteredData = [];
  for (let j = 0; j < delay * ticksPerBeat * BEAT; j++){
    filteredData.push(0);
  }
  for (let i = 0; i < parseInt(samples); i++) {
    let blockStart = blockSize * i; // the location of the first sample in the block
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
    }
    filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
  }
  return filteredData;
};

/**
 * Normalizes the audio data to make a cleaner illustration 
 * @param {Array} filteredData the data from filterData()
 * @returns {Array} an normalized array of floating point numbers
 */
const normalizeData = filteredData => {
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    var resultData = filteredData.map(n => n * multiplier)
    return resultData;
}

/**
 * Draws the audio file into a canvas element.
 * @param {Array} normalizedData The filtered array returned from filterData()
 * @returns {Array} a normalized array of data
 */
const draw = (normalizedData, index) => {
    indexArray.push(index);

  // set up the canvas
  const canvas = document.getElementsByClassName("track_canvas")[index];
  const dpr = window.devicePixelRatio || 1;
  const padding = 20;
  canvas.setAttribute('style', 'width: '+(normalizedData.length * 6)+'px;');
  canvas.offsetWidth = normalizedData.length * 4;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.translate(0, canvas.offsetHeight / 2 + padding); // set Y = 0 to be in the middle of the canvas

  for (let i = 0; i < parseInt(canvas.offsetWidth / 8 / 4) ; i++ ){
    ctx.lineWidth = 1; // how thick the line is
    if (i % BEAT == 0 ){
        ctx.strokeStyle = "#AAB8C2";
    } else {
        ctx.strokeStyle = "#fff"; // what color our line is
    }
    ctx.beginPath();
    ctx.moveTo(i * 8 * 4, -1 * canvas.offsetHeight);
    ctx.lineTo(i * 8 * 4, canvas.offsetHeight);
    ctx.stroke();
  }

  // draw the line segments
  const width = 4;
  for (let i = 0; i < normalizedData.length; i++) {
    const x = width * i;
    let height = normalizedData[i] * canvas.offsetHeight - padding;
    if (height < 0) {
        height = 0;
    } else if (height > canvas.offsetHeight / 2) {
        height = height > canvas.offsetHeight / 2;
    }
    drawLineSegment(ctx, x, height, width, (i + 1) % 2);
  }
};

/**
 * A utility function for drawing our line segments
 * @param {AudioContext} ctx the audio context 
 * @param {number} x  the x coordinate of the beginning of the line segment
 * @param {number} height the desired height of the line segment
 * @param {number} width the desired width of the line segment
 * @param {boolean} isEven whether or not the segmented is even-numbered
 */
const drawLineSegment = (ctx, x, height, width, isEven) => {
  ctx.lineWidth = 1; // how thick the line is
  ctx.strokeStyle = "#1DA1F2"; // what color our line is
  ctx.beginPath();
  //height = 50 - height;
  height = isEven ? height : -height;
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.arc(x + width / 2, height, width / 2, Math.PI, 0, isEven);
  ctx.lineTo(x + width, 0);
  ctx.stroke();
};

const addAudio = (url, title, index, delay) => {
    audioArray.push(new Audio(url));
    document.getElementsByClassName('tracklist')[0].innerHTML += '<div class="track_item" ><div class="track_title" style="top: '+index*110+'px;">'+title+'</div><canvas class="track_canvas"></canvas></div>';
    drawAudio(url, index, delay);
}

const playButton = document.getElementsByClassName('playbutton')[0];
var playAnimation;

const BPM = parseInt(document.getElementById('bpm').innerText);
const BEAT = parseInt(document.getElementById('beat1').innerText)/parseInt(document.getElementById('beat2').innerText) * 4;

var delayArray = []; 
var audioArray = [];
var indexArray = [];

addAudio('assets/Melody-Sample.m4a', '멜로디', 0, 0);
addAudio('assets/Bass-Sample.m4a','베이스' , 1, 0);
addAudio('assets/Drum-Sample.m4a', '드럼', 2, 0);

var vLine = document.getElementsByClassName('v-line')[0];
var vLinePosition = 0;
vLine.setAttribute('style', 'height: '+indexArray.length * 110+'px; left: '+vLinePosition+'px;');

function asyncPlay(index) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            audioArray[index].play();
            resolve();
        }, delayArray[index]);
    });
  }

async function parallel(array) {
    const promises = array.map((index) => asyncPlay(index));
    await Promise.all(promises);
    console.log("all done :)");
  }

playButton.addEventListener('click', function(event){
    if (playButton.innerHTML == '<i class="bx bx-play-circle"></i>') {
        playButton.innerHTML = '<i class="bx bx-pause-circle"></i>';
        parallel(indexArray);
        (function repeatOften() {
            vLinePosition += 32*BPM/60/60;
            vLine.setAttribute('style', 'height: '+indexArray.length * 110+'px; left: '+vLinePosition+'px;');
            playAnimation = requestAnimationFrame(repeatOften);
        })();
    } else if (playButton.innerHTML == '<i class="bx bx-pause-circle"></i>') {
        playButton.innerHTML = '<i class="bx bx-play-circle"></i>';
        for (var i = 0; i < indexArray.length; i++){
            audioArray[i].pause();
            cancelAnimationFrame(playAnimation);
        }
    }
});

document.getElementsByClassName('tracklist')[0].addEventListener('click', function(event){
    var x = event.offsetX;
    vLinePosition = x;
    vLine.setAttribute('style', 'height: '+indexArray.length * 110+'px; left: '+vLinePosition+'px;');
    playButton.innerHTML = '<i class="bx bx-play-circle"></i>';
    for (var i = 0; i < indexArray.length; i++){
        audioArray[i].pause();
        cancelAnimationFrame(playAnimation);
        audioArray[i].currentTime = x*60/32/BPM;
    }
});