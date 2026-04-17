import Toastify from 'toastify-js';
import gtmTracking from '@common/vanilla_ui/tracking/gtm';


function initializeRegisterForm({
  registerForm, formId, submitCallback, submittedCallback, initializeInputs,
  errorCallback,
}) {
  registerForm.on('initialize', () => {
    if (initializeInputs) {
      initializeInputs();
    }
  });
  registerForm.on('error', error => {
    let message = 'Something went wrong! Please try again later';
    if (error && error.isFromServer) {
      switch (error.response.status) {
        case 429:
          message = 'Request rate exceeded, please try after sometime';
          break;
        case 422:
          message = 'Please fill the required fields';
          break;
        case 403:
          message = 'Fill the details and click on Get Verification Code first';
          break;
        case 409:
          message = 'Phone number is linked to a different email';
          break;
        case 401:
          message = 'Incorrect Verification Code entered';
          break;
        case 404:
          message = 'Fill the details and click on Get Verification Code first';
          break;
        case 400:
          message = error.responseJson.message;
          registerForm.setDisabled(true);
          break;
        default:
        // Do nothing
      }
      gtmTracking.sendFormSubmitStatus(
        `${formId}-submit`, false, message,
      );
      if (errorCallback) {
        errorCallback();
      }
      const errorDispatched = new Event('phoneVerificationFailed', {
        errorMsg: message,
      });
      document.dispatchEvent(errorDispatched);
    }
    Toastify({
      text: message,
      className: 'toastify-danger',
    }).showToast();
    registerForm.setError(message);
  });
  registerForm.on('submit', () => {
    if (submitCallback) {
      submitCallback();
    }
  });
  registerForm.on('submitted', () => {
    gtmTracking.sendFormSubmitStatus(`${formId}-submit`, true);
    registerForm.setDisabled(true);
    if (submittedCallback) {
      submittedCallback();
    }
  });
  registerForm.initialize();
}

export default {
  initialize: initializeRegisterForm,
};
