import * as sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import { isDevelopment, log } from '@common/utils/debug';
import { isString } from '@common/utils/type';
import { isUserLoggedIn } from '@common/utils/misc';

// const IGNORE_ERRORS = [
//   '*ResizeObserver*',
//   '*webengage*',
//   '*fbq*',
//   '*reCAPTCHA has already been rendered in this element*',
//   '*NetworkError*',
//   '*AbortError*',
//   '*disconnected*',
//   '*Loading CSS chunk*',
//   '*QuotaExceededError*',
//   '*Failed to fetch*',
//   '*myinterviewtrainer*',
//   '*Cannot redefine property: googletag*',
//   '*ApxorRTM*',
//   '*window.lintrk*',
//   '*401*',
//   '*user denied permission*',
//   '*window.uetq*',
// ];
// const ALLOW_URLS = [
//   '*scaler.com*',
//   '*staging.sclr.ac*',
// ];
const DENY_URLS = [];

/**
 * Enable sentry in your app to monitor errors and measure performance
 * Steps to enable Sentry in your app
 *
 * 1. Create an object for this class
 * 2. Call enableCapture method on useEffect of your app to enable
 * 3. Call close in return to remove sentry after unmount.
 * 4. Call enableProfiler with root component of your App and export the return
 * 5. Call enableRedux and combine rootStore and Sentry Enhancer
 * 6. Test and deploy your Code.
 */
class Sentry {
  endpoint = process.env.SENTRY_DSN_URL;

  /**
   * Ensures that sentry is enabled only once
   * To re-enable, close the earlier connection via sentry.close()
   * and then call enableCapture again
   * @type {boolean}
   */
  enabled = false;

  constructor(projectName = 'internal') {
    this.endpoint = this._createEndpoint(projectName);
  }

  /**
   * Start sentry listener and send the errors to sentry
   */
  enableCapture() {
    if (isDevelopment() || this.enabled) {
      return;
    }
    const integrations = [
      new Integrations.BrowserTracing(),
      new sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ];

    const isInjectedCode = (event) => {
      const frames = event?.exception?.values?.[0]?.stacktrace?.frames;

      if (!frames || frames.length === 0) return false;

      const firstFrame = frames[0];
      if (firstFrame.filename === '<anonymous>') {
        return true;
      }

      const lastFrame = frames[frames.length - 1];
      if (
        isString(lastFrame.module)
        && isString(lastFrame.filename)
        && (
          lastFrame.module.startsWith('assets/web')
          || lastFrame.module.startsWith('packs/js/frontend')
          || lastFrame.module.startsWith('frontend/src')
          || lastFrame.module.startsWith('app/javascript')
          // static file should not be considered as injected code.
          // We use react-script currently, and all js-generated files
          // are in this "static" directory.
          || lastFrame.filename.includes('/static/')
        )
      ) {
        return false;
      }

      // Remove GTM errors
      return !!frames.some(
        (frame) => isString(frame.filename)
          && (frame.filename.startsWith('https://www.googletagmanager.com')
            || frame.filename === '/gtm.js'),
      );
    };

    const beforeSend = (event) => {
      if (isInjectedCode(event)) {
        return null;
      }
      return event;
    };

    sentry.init({
      dsn: this.endpoint,
      environment: process.env.NODE_ENV,
      // ignoreErrors: IGNORE_ERRORS,
      denyUrls: DENY_URLS,
      // allowUrls: ALLOW_URLS,
      normalizeDepth: 200,
      tracesSampleRate: 0.3,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
      integrations,
      beforeSend,
    });
    if (isUserLoggedIn()) {
      sentry.setUser({
        email: window.__CURRENT__USER__?.email,
      });
    }
    this.enabled = true;
  }

  /**
   * Close Sentry Listener and stop error capture.
   * @param callback {function}
   */
  close(callback = () => {}) {
    sentry.close().then(callback);
    this.enabled = false;
  }

  /**
   * Enable Profiling your App.
   * @param reactComponent
   * @param appName {string}
   * @returns {React.FC<Record<string, any>>|*}
   */
  enableProfiler = (reactComponent, appName) => {
    if (isDevelopment()) {
      return reactComponent;
    }

    return sentry.withProfiler(reactComponent, { name: appName });
  };

  /*
    this is the middleware passed to redux to report unhandler errors
    we are doing this because redux Sentry.enableCapture captures
    incomplete error
  */
  reduxUnhandledErrorReporter = (store) => (next) => (action) => {
    try {
      return next(action); // dispatch
    } catch (err) {
      if (isDevelopment()) {
        throw new Error(err);
      } else {
        sentry.captureException(err, {
          extra: { action, state: store.getState() },
        });
      }
    }
    return null;
  };
  /* */

  /**
   * Allow sentry to capture your state changes
   * @returns {any}
   */
  enableRedux = () => sentry.createReduxEnhancer();

  /**
   * Deliberately Capture Exception and send to Sentry
   * @param error
   */
  captureException = (error) => {
    if (isDevelopment()) {
      throw new Error(error);
    }
    return sentry.captureException(error);
  };

  /**
   * Deliberately Capture Message and send to Sentry
   * @param message {string}
   */
  captureMessage = (message) => {
    if (isDevelopment()) {
      return log(message);
    }

    return sentry.captureMessage(message);
  };

  /* Private */

  /**
   * Returns the endpoint URL required by Sentry to push events.
   * @param projectName {string}
   * @returns {string}
   */
  // eslint-disable-next-line no-unused-vars
  _createEndpoint = (projectName) => this.endpoint;
}

export default new Sentry();
