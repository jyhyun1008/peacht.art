/*
    This is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// Set up audio context
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

/**
 * Retrieves audio from an external source, the initializes the drawing function
 * @param {String} url the url of the audio we'd like to fetch
 */
const drawAudio = (url, index) => {
  fetch(url)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => draw(normalizeData(filterData(audioBuffer)), index));
};

/**
 * Filters the AudioBuffer retrieved from an external source
 * @param {AudioBuffer} audioBuffer the AudioBuffer from drawAudio()
 * @returns {Array} an array of floating point numbers
 */
const filterData = audioBuffer => {
  const BPM = parseInt(document.getElementById('beat').innerText);
  const ticksPerBeat = 8;
  const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
  if (rawData.sampleRate) {
    var sampleRate = rawData.sampleRate;
  } else {
    var sampleRate = 48000;
  }
  //const samples = 1400; // Number of samples we want to have in our final data set
  const samples = rawData.length * ticksPerBeat * BPM / 60 / sampleRate; // Number of samples we want to have in our final data set
  const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
  const filteredData = [];
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

    const canvas = document.getElementsByClassName("track_canvas")[index];
    canvas.setAttribute('width', String(normalizedData.length * 6));
    for (let i = 0; i < normalizedData.length; i++){
        canvas.innerHTML += '<div class="waveSegment" height="'+(normalizedData[i]*canvas.style.height)+'px"></div>';
    }
};


drawAudio('assets/sample.mp3', 0);
drawAudio('assets/sample.mp3', 1);