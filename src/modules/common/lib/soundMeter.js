/* eslint-disable */
/**
 * Idea taken from
 * https://github.com/webrtc/samples/blob/gh-pages/src/content/getusermedia/volume/js/soundmeter.js
 */
/* eslint-enable */

import clamp from 'lodash/clamp';

import { isIOS, isSafari } from '@common/utils/platform';
import EventEmitter from './eventEmitter';

window.AudioContext = window.AudioContext || window.webkitAudioContext;

function SoundMeter() {
  this.context = new window.AudioContext();
  this.level = 0;
  this.analyser = this.context.createAnalyser();
  this.script = this.context.createScriptProcessor(2048, 1, 1);
  this.analyser.smoothingTimeConstant = 0.8;
  this.analyser.fftSize = 1024;
  this.script.onaudioprocess = () => {
    const array = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(array);
    let values = 0;
    for (let i = 0; i < array.length; i += 1) {
      values += (array[i]);
    }

    this.level = clamp(values / array.length, 0, 100);
    this.emit('level-change', this);
  };
}

// Extend event emitter
SoundMeter.prototype = new EventEmitter();

SoundMeter.isSupported = function () {
  const isPlatformSupported = !isIOS() && !isSafari();
  const isApiAvailable = !!window.AudioContext;
  return isPlatformSupported && isApiAvailable;
};


SoundMeter.prototype.connectToSource = function (stream) {
  try {
    this.mic = this.context.createMediaStreamSource(stream);
    this.mic.connect(this.analyser);
    this.analyser.connect(this.script);
    // necessary to make sample run, but should not be.
    this.script.connect(this.context.destination);
  } catch (e) {
    // Do nothing
  }
};

SoundMeter.prototype.stop = function () {
  this.off('level-change');
  this.mic.disconnect();
  this.script.disconnect();
  this.context.close();
};

export default SoundMeter;
