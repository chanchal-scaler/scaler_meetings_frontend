import { isFunction, isObject } from '@common/utils/type';

const ANDROID_WEBVIEW_INTERFACE_NAME = 'ScalerDroidJSBridge';

export function notifyWebview(event, data) {
  // Running this as promise so that it can never break our main web
  // app code flow
  return new Promise(resolve => {
    if (
      window[ANDROID_WEBVIEW_INTERFACE_NAME]
      && window[ANDROID_WEBVIEW_INTERFACE_NAME][event]
      && isFunction(window[ANDROID_WEBVIEW_INTERFACE_NAME][event])
    ) {
      let _data = data;
      if (_data && isObject(_data)) {
        _data = JSON.stringify(_data);
      }

      window[ANDROID_WEBVIEW_INTERFACE_NAME][event](_data);
    }
    resolve();
  });
}

export function evaluateInWebview(fnName, ...args) {
  if (
    window[ANDROID_WEBVIEW_INTERFACE_NAME]
    && window[ANDROID_WEBVIEW_INTERFACE_NAME][fnName]
    && isFunction(window[ANDROID_WEBVIEW_INTERFACE_NAME][fnName])
  ) {
    return window[ANDROID_WEBVIEW_INTERFACE_NAME][fnName](...args);
  } else {
    return null;
  }
}
