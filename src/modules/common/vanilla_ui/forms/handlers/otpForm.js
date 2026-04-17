import Toastify from 'toastify-js';
import FormTracker from '@common/vanilla_ui/forms/tracking/formTracker';
import gtmTracking from '@common/vanilla_ui/tracking/gtm';
import Validator from '@common/lib/validator';

const validator = new Validator({
  phone: {
    required: true,
    type: 'mobile',
    message: 'Please enter a valid phone number.',
  },
});

const getInputFields = (emailInput, phoneInput) => {
  const validInputs = [];
  if (emailInput) {
    validInputs.push(emailInput);
  }
  if (phoneInput) {
    validInputs.push(phoneInput);
  }

  return validInputs;
};

const validatePhoneNumber = (phoneInput, phoneCountryInput) => {
  const phone = `${phoneCountryInput.value || ''}-${phoneInput.value || ''}`;
  const errors = validator.check({ phone });

  return !errors;
};

const checkFormValidity = (
  emailInput, phoneInput, phoneCountryInput,
) => (emailInput ? (
  emailInput.value
    && validatePhoneNumber(phoneInput, phoneCountryInput)
) : (
  validatePhoneNumber(phoneInput, phoneCountryInput)
));

const checkRadioButtonClicked = (element) => {
  const value = element.querySelectorAll('input[type=radio]');
  const atLeastOneChecked = Array.from(value).some(
    input => input.checked,
  );
  return atLeastOneChecked;
};

const isValueFilled = (element) => {
  // checking for a list of radio inputs
  if (element.classList.contains('radio-group')) {
    return checkRadioButtonClicked(element);
  } else {
    return element.value.length > 0;
  }
};

const areAllFieldsFilled = (elements) => elements.every(
  el => el && isValueFilled(el),
);

const trackEmailInput = (emailInput, formName, track, className) => {
  if (emailInput) {
    track(className, 'click', formName.getFieldValue('email'));
  }
};

const updateRecaptchaClassList = (recaptchaEl, hideClass) => {
  if (recaptchaEl) {
    if (hideClass) {
      recaptchaEl.classList.add('hidden');
    } else {
      recaptchaEl.classList.remove('hidden');
    }
  }
};

const shouldEnableOtpButton = (
  form,
  parentFormId,
  track,
  customInputFields = [],
) => {
  const recaptchaEl = document.getElementById(`${parentFormId}-recaptcha`);
  const emailInput = document.getElementById(`${parentFormId}__email`);
  const phoneInput = document.getElementById(
    `${parentFormId}__phone-number`,
  );
  const phoneCountryInput = document.getElementById(
    `input-${parentFormId}__phone-code`,
  );
  const otpTrigger = document.querySelector(
    `.${parentFormId}__otp-submit`,
  );

  const inputFields = getInputFields(emailInput, phoneInput);

  function enableSubmitButton() {
    if (checkFormValidity(emailInput, phoneInput, phoneCountryInput)) {
      if (areAllFieldsFilled(customInputFields) && otpTrigger) {
        otpTrigger.classList.remove('is-disabled');
      }
      updateRecaptchaClassList(recaptchaEl, false);
      trackEmailInput(emailInput, form, track, 'get-otp-enable');
    } else if (otpTrigger && !otpTrigger.classList.contains('is-disabled')) {
      if (otpTrigger) {
        otpTrigger.classList.add('is-disabled');
      }
      updateRecaptchaClassList(recaptchaEl, true);
      trackEmailInput(emailInput, form, track, 'get-otp-disable');
    }
  }

  customInputFields.forEach(el => {
    if (el) {
      if (el.classList.contains('radio-group')) {
        const allRadioInputs = el.querySelectorAll('input[type=radio]');

        allRadioInputs.forEach(radioEle => {
          radioEle.addEventListener('click', () => {
            enableSubmitButton();
          });
        });
      } else {
        el.addEventListener('input', () => {
          enableSubmitButton();
        });
      }
    }
  });
  const extraInputFields = [];
  customInputFields.forEach(el => {
    if (!el) return;

    if (el.classList.contains('radio-group')) {
      const allRadioInputs = el.querySelectorAll('input[type=radio]');
      extraInputFields.push(...allRadioInputs);
    } else {
      extraInputFields.push(el);
    }
  });

  extraInputFields.forEach(el => {
    el.addEventListener('change', () => {
      enableSubmitButton();
    });
  });

  inputFields.forEach(el => {
    el.addEventListener('blur', () => {
      enableSubmitButton();
    });
  });
  phoneInput.addEventListener('input', () => {
    enableSubmitButton();
  });
  enableSubmitButton();
};

function initializeOtpForm({
  otpForm, registerForm, otpVoiceForm, otpMsgForm, initializeInputs,
  parentFormId, formId, track, submittedCallback, enableOtpForm,
  customInputFields = [], program, errorCallback,
}) {
  let registrationTracking = null;
  registrationTracking = new FormTracker('marketing-form-submit');

  otpForm.on('initialize', () => {
    initializeInputs();
    shouldEnableOtpButton(otpForm, parentFormId, track, customInputFields);
  });
  otpForm.on('submitted', () => {
    Toastify({
      text: 'You will receive the verification code shortly',
      className: 'toastify-info',
    }).showToast();
    gtmTracking.sendFormSubmitStatus(formId, true);
    enableOtpForm();
    registerForm.updateField(
      'phone_number', otpForm.getFieldValue('phone_number'),
    );

    const emailInput = document.getElementById(`${parentFormId}__email`);
    if (emailInput) {
      registerForm.updateField(
        'email', otpForm.getFieldValue('email'),
      );
    }
    otpVoiceForm.updateField(
      'phone_number', otpForm.getFieldValue('phone_number'),
    );
    if (emailInput) {
      otpVoiceForm.updateField(
        'email', otpForm.getFieldValue('email'),
      );
    }
    otpMsgForm.updateField(
      'phone_number', otpForm.getFieldValue('phone_number'),
    );
    if (emailInput) {
      otpMsgForm.updateField(
        'email', otpForm.getFieldValue('email'),
      );
    }
    if (submittedCallback) {
      submittedCallback();
    }
    registerForm.setDisabled(false);
    otpVoiceForm.reset();
    otpMsgForm.reset();
    trackEmailInput(emailInput, registerForm, track, 'otp-request');
  });
  otpForm.on('error', error => {
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
          message = 'Email already registered';
          break;
        case 406:
          message = `Recaptcha validity has expired,
            please try refreshing the page`;
          window.fallbackVisibleTurnstile(formId);
          window.fallbackToRecaptchaV2(formId);
          break;
        case 409:
          message = 'Phone number is linked to a different email';
          break;
        case 400:
          message = error.responseJson.message;
          break;
        default:
        // Do nothing
      }
      registrationTracking.formStatusTracking(
        `scaler-landing-marketing-form-otp-submit-${program}-error`,
        { error_message: message },
      );
      gtmTracking.sendFormSubmitStatus(
        formId, false, message,
      );
    }
    Toastify({
      text: message,
      className: 'toastify-danger',
    }).showToast();
    otpForm.setError(message);
    if (errorCallback) {
      errorCallback();
    }
  });
  otpForm.initialize();
}

export default {
  initialize: initializeOtpForm,
};
