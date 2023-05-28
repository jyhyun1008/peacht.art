
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
    document.getElementsByClassName('tracklist')[0].innerHTML += '<div class="track_item" ><div class="track_controller" style="bottom: '+(trackCounts*113.8 - index*113.8 + 78)+'px;"><span class="track_title">'+title+'</span><span class="track_mute">M</span></div><canvas class="track_canvas"></canvas></div>';
    drawAudio(url, index, delay);
}

const playButton = document.getElementsByClassName('playbutton')[0];
var playAnimation;
