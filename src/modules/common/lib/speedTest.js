import { sampleAssetUrl } from '@common/utils/constants';

let didRunSpeedTest = false;

class SpeedTest {
  static isEnabled() {
    return (
      window.storeEsEvent
      && window.ENV_VARS
      && window.ENV_VARS.config
      && window.ENV_VARS.config.speed_test_enabled
    );
  }

  constructor(assetUrl) {
    this._assetUrl = assetUrl;
    this._size = 0;
  }

  measureDownlink(timeout = 5000) {
    return new Promise((resolve) => {
      this._request = new XMLHttpRequest();
      this._request.responseType = 'blob';

      this._timeout = setTimeout(() => {
        this._request.abort();
        resolve({ speed: this.speed, completed: false });
      }, timeout);

      this._request.onload = () => {
        // we only need to know when the request has completed
        if (this._request.status === 200) {
          clearTimeout(this._timeout);
          this._createHeadersMap();

          // Here we stop the timer & register end time
          this._endTime = Date.now();
          this._size = this._responseHeaders['content-length'];
          resolve({ speed: this.speed, completed: true });
        }
      };

      this._request.onprogress = (event) => {
        this._endTime = Date.now();
        this._size = event.loaded;
      };

      this._startTime = Date.now();
      this._request.open('GET', `${this._assetUrl}?v=${Date.now()}`, true);
      this._request.send();
    });
  }

  get speed() {
    if (this._size === 0) {
      return 0;
    } else {
      const sizeInKb = (this._size * 8) / 1024;
      const timeTakenInSec = (this._endTime - this._startTime) / 1000;
      return sizeInKb / timeTakenInSec;
    }
  }

  _createHeadersMap() {
    const headers = this._request.getAllResponseHeaders();

    // Convert the header string into an array
    // of individual headers
    const arr = headers.trim().split(/[\r\n]+/);

    // Create a map of header names to values
    const headerMap = {};
    arr.forEach((line) => {
      const parts = line.split(': ');
      const header = parts.shift();
      const value = parts.join(': ');
      headerMap[header.toLowerCase()] = value;
    });

    this._responseHeaders = headerMap;
  }

  static checkLastSpeedTest() {
    if (typeof (Storage) !== 'undefined') {
      const timeDiff = Date.now()
        - parseInt(localStorage.getItem('speedtest-time'), 10);
      const minutesDiff = Math.floor(timeDiff / 1000 / 60);
      if (minutesDiff <= 10) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}

export function runSpeedTest() {
  if (didRunSpeedTest) {
    return;
  }

  if (SpeedTest.checkLastSpeedTest()) {
    return;
  }

  didRunSpeedTest = true;
  window.addEventListener('load', async () => {
    if (SpeedTest.isEnabled()) {
      const speedTest = new SpeedTest(sampleAssetUrl);
      const result = await speedTest.measureDownlink();
      // eslint-disable-next-line no-console
      console.info('Download speed:', result.speed.toFixed(2), 'kbps');
      window.storeEsEvent('download-speed', 'log', result.speed);
      if (result.completed && typeof (Storage) !== 'undefined') {
        try {
          localStorage.setItem('speedtest-time', Date.now());
        // ignoring them for know
        // eslint-disable-next-line no-empty
        } catch (e) {}
      }
    }
  });
}

export default SpeedTest;
