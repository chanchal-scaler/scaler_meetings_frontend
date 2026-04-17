import { apiRequest } from '@common/api/utils';

const trackEvent = (message) => {
  window.GTMtracker?.pushEvent({
    event: 'gtm_custom_click',
    data: {
      click_text: message,
      click_type: 'Truecaller auth',
    },
  });
};

const createUserSession = async (requestId) => {
  let response;
  try {
    response = await apiRequest(
      'POST',
      '/api/v3/auth/truecaller/create',
      { requestId },
    );
    trackEvent('User session created');
  } catch (error) {
    response = error.responseJson;
    trackEvent(`User session creation failed, ${response?.message}`);
  }

  return response;
};

const handleVerificationStatus = async (data, requestId, intervalId) => {
  let response;
  if (data.success && data.status === 'verified') {
    clearInterval(intervalId);
    response = await createUserSession(requestId);
  }
  return response;
};

const handleRenderingStatus = (data, intervalId) => {
  if (!data.success || (data.success
    && ['verified', 'flow_invoked'].includes(data.status))) {
    clearInterval(intervalId);
    const event = new Event('truecaller-widget-rendered');
    document.dispatchEvent(event);
    return true;
  }
  return false;
};

const pollVerificationStatus = (requestId) => (
  new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      try {
        const result = await apiRequest(
          'GET',
          '/api/v3/auth/truecaller/poll',
          { requestId },
        );

        trackEvent(result.message);
        const response = await handleVerificationStatus(
          result,
          requestId,
          intervalId,
        );
        if (response) {
          resolve(response);
        }
      } catch (error) {
        trackEvent(error.responseJson?.message);
        clearInterval(intervalId);
        reject();
      }
    }, 2000);
  })
);

const pollWidgetRenderingStatus = (requestId, interval, maxExecutions) => (
  new Promise((resolve, reject) => {
    let counter = 0;
    const intervalId = setInterval(async () => {
      try {
        const result = await apiRequest(
          'GET',
          '/api/v3/auth/truecaller/poll',
          { requestId },
        );

        trackEvent(result.message);
        const rendered = handleRenderingStatus(result, intervalId);
        if (rendered) {
          resolve(true);
        }
        counter += 1;
        if (counter >= maxExecutions) {
          clearInterval(intervalId);
          resolve(false);
        }
      } catch (error) {
        trackEvent(error.responseJson?.message);
        clearInterval(intervalId);
        reject();
      }
    }, interval);
  })
);

const fetchVerificationRequestId = async () => {
  let requestId;
  try {
    const response = await apiRequest(
      'GET',
      '/api/v3/auth/truecaller/new',
    );
    requestId = response?.request;
    trackEvent('Truecaller auth request created');
  } catch (error) {
    trackEvent('Truecaller auth request creation failed');
  }

  return requestId;
};

const initializeWidget = async (requestId, widgetConfig) => {
  window.location = 'truecallersdk://truesdk/web_verify?'
    + `&requestNonce=${requestId}`
    + `&partnerKey=${window.truecallerConfig.appKey}`
    + `&partnerName=${window.truecallerConfig.partnerName}`
    + `&lang=${window.truecallerConfig.lang}`
    + `&privacyUrl=${window.truecallerConfig.privacyUrl}`
    + `&termsUrl=${window.truecallerConfig.termsUrl}`
    + `&type=${widgetConfig.type}`
    + `&loginPrefix=${widgetConfig.loginPrefix}`
    + `&loginSuffix=${widgetConfig.loginSuffix}`
    + `&ctaPrefix=${widgetConfig.ctaPrefix}`
    + `&ctaColor=${widgetConfig.ctaColor}`
    + `&ctaTextColor=${widgetConfig.ctaTextColor}`
    + `&btnShape=${widgetConfig.btnShape}`
    + `&skipOption=${widgetConfig.skipOption}`
    + `&ttl=${widgetConfig.ttl}`;

  try {
    return await pollWidgetRenderingStatus(requestId, 2000, 5)
      || await pollWidgetRenderingStatus(requestId, 3000, 5);
  } catch {
    return false;
  }
};

async function authHandler(widgetConfig = {}, requestId = '') {
  const finalRequestId = requestId || await fetchVerificationRequestId();
  if (finalRequestId) {
    const widgetPresent = await initializeWidget(finalRequestId, widgetConfig);
    if (widgetPresent) {
      trackEvent('Truecaller widget triggered');
      try {
        const response = await pollVerificationStatus(finalRequestId);
        if (response?.success) {
          return response;
        }
      } catch {
        return null;
      }
    }
  }

  return null;
}

export default {
  authHandler,
  fetchVerificationRequestId,
};
