import { isIOS, isSafari } from '@common/utils/platform';
import { isWindowHidden } from '@common/utils/browser';
import alert from '@common/audio/notifications/beeper.ogg';
import info from '@common/audio/notifications/ponderous.ogg';
import ping from '@common/audio/notifications/information-block.ogg';

const audios = {
  alert: new Audio(alert),
  info: new Audio(info),
  ping: new Audio(ping),
};

class AudioNotification {
  constructor(type) {
    this._audio = audios[type];
  }

  play(force = false) {
    // Safari does not support ogg files
    if (isSafari() || isIOS()) {
      return;
    }

    // By default play audio only if window is hidden
    if (isWindowHidden() || force) {
      this._audio.play();
      this._audio.currentTime = 0;
    }
  }
}

export default AudioNotification;
