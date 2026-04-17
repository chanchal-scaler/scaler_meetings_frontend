import api from './api';
import { bookLiveClass } from '@common/vanilla_ui/forms/bookLiveClass';
import {
  otpFormId,
  otpResponseMap,
  resendOtpResponseMap,
  signupFormId,
  serverErrorMessage,
  toastifyDanger,
  toastifySuccess,
  userCreationResponseMap,
} from './constants';
import utils from './utils';
import gtmTracking from '@common/vanilla_ui/tracking/gtm';

export function showFieldEventListener(type, sourceInput, formId, targetNames) {
  if (document.querySelector(`input[name=${sourceInput}]`)) {
    if (sourceInput === `normalized_phone`) {
      document.querySelector(`input[name=${sourceInput}]`)
        .addEventListener(
          type, () => utils.showHiddenField(formId, targetNames),
        );
    } else {
      document.querySelector(`input[name=${sourceInput}]`)
        .addEventListener(
          type, () => utils.showHiddenField(formId, targetNames),
        );
    }
  }
}

export async function otpResend(voice = false) {
  utils.toggleButtons(true);
  let toastifyMessage = 'You will receive OTP shortly!';
  let toastifyClass = toastifySuccess;
  try {
    await api.resendOtp(voice);
  } catch (error) {
    toastifyClass = toastifyDanger;
    if (error.response && resendOtpResponseMap[error.response.status]) {
      const code = error.response.status;
      if (code === 422 || code === 404 || code === 409) {
        utils.toggleScreens([otpFormId, signupFormId]);
      }
      toastifyMessage = resendOtpResponseMap[code];
    } else {
      toastifyMessage = serverErrorMessage;
    }
  }
  utils.toastifyAndButtonEnable(toastifyMessage, toastifyClass);
}

export async function otpVerify(e, config) {
  e.preventDefault();
  utils.toggleButtons(true);
  let toastifyMessage = serverErrorMessage;
  let success = true;
  try {
    await api.verifyOtp(config.type);
    toastifyMessage = 'OTP Verified! Please wait redirecting...';
    utils.toastify(toastifyMessage, toastifySuccess);
    gtmTracking.sendFormSubmitStatus('otp_form', true);
    await bookLiveClass(config.type);
    // await api.submitDetails();
  } catch (error) {
    success = false;
    if (error.response && otpResponseMap[error.response.status]) {
      toastifyMessage = otpResponseMap[error.response.status];
      if (error.response.status === 409 || error.response.status === 404) {
        utils.toggleScreens([otpFormId, signupFormId]);
      }
    }
    utils.toastifyAndButtonEnable(toastifyMessage, toastifyDanger);
    gtmTracking.sendFormSubmitStatus('otp_form', false, toastifyMessage);
  }
  if (config.createATSAfterVerification && success) {
    try {
      await api.createATS(config.createATSEndPoint);
    } catch (error) {
      toastifyMessage = `Something went wrong! Please reload the page and
      try again`;
    }
  }
}

export async function registration(e, validations) {
  e.preventDefault();
  if (!utils.areValidFields(validations, e)) {
    return;
  }
  utils.toggleButtons(true);
  let toastifyMessage = serverErrorMessage;
  let toastifyClass = toastifySuccess;
  try {
    await api.register();
    toastifyMessage = 'OTP has been sent on your phone number!';
    gtmTracking.sendFormSubmitStatus('signup_form', true);
    utils.toggleScreens([signupFormId, otpFormId]);
  } catch (error) {
    toastifyClass = toastifyDanger;
    if (error.response && userCreationResponseMap[error.response.status]) {
      toastifyMessage = userCreationResponseMap[error.response.status];
      gtmTracking.sendFormSubmitStatus('signup_form', false, toastifyMessage);
    }
    if (error.response && error.response.status === 429) {
      toastifyMessage = 'OTP has been sent on your phone number!';
      toastifyClass = toastifySuccess;
      gtmTracking.sendFormSubmitStatus('signup_form', true);
      utils.toggleScreens([signupFormId, otpFormId]);
    }
  }
  utils.toastifyAndButtonEnable(toastifyMessage, toastifyClass);
}

export default {
  register: registration,
  verifyOtp: otpVerify,
  resendOtp: otpResend,
  showHiddenField: showFieldEventListener,
};
