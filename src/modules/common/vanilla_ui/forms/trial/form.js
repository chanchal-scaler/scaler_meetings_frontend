import {
  orgyearInputEl, orgyearInputId,
  otpFormEl, otpFormId, signupFormEl,
  signupFormId, whatsappConsentInputEl,
  universityInputEl, universityInputId,
  orgnameInputId, orgnameInputEl,
  positionInputEl, positionInputId, otherPositionFieldEl, otherPositionInputEl,
} from './constants';
import eventListener from './eventListener';
import utils from './utils';
import api from './api';

function initializeForm(config, validations = {}) {
  const inputFieldSelector = 'input,select';
  // utils.createSelect(experienceMonthsInputEl, experienceMonthsInputId, true);
  // utils.createSelect(experienceYearsInputEl, experienceYearsInputId, true);
  utils.createSelect(orgyearInputEl, orgyearInputId, true);
  const positionSelect = utils.createSelect(
    positionInputEl, positionInputId, true,
  );
  utils.createGeneralSelect(
    universityInputEl, universityInputId, {
      isAsync: true,
      isCreatable: true,
      loadOptions: async (keyword) => api.getUniversities(keyword),
    },
  );
  utils.createGeneralSelect(
    orgnameInputEl, orgnameInputId, {
      isAsync: true,
      isCreatable: true,
      loadOptions: async (keyword) => api.getCompanies(keyword),
    },
  );

  positionSelect.on('change', (value) => {
    if (value.toLowerCase() === 'other') {
      otherPositionFieldEl.classList.remove('hidden');
      positionInputEl.classList.add('ib-field');

      otherPositionInputEl.required = true;
    } else {
      otherPositionFieldEl.classList.add('hidden');
      positionInputEl.classList.remove('ib-field');
      otherPositionInputEl.required = false;
    }
  });

  whatsappConsentInputEl.addEventListener('click', () => {
    if (whatsappConsentInputEl.value === 'whatsapp_consent_yes') {
      whatsappConsentInputEl.setAttribute('value', 'whatsapp_consent_no');
    } else {
      whatsappConsentInputEl.setAttribute('value', 'whatsapp_consent_yes');
    }
  });

  eventListener.showHiddenField(
    `focus`, `normalized_phone`, signupFormId,
    [`orgyear`, `whatsapp_consent`, `university`,
      `orgname`, `position`],
  );

  signupFormEl
    .addEventListener(
      'submit',
      async (e) => eventListener.register(e, validations),
    );
  otpFormEl
    .addEventListener(
      'submit',
      async (e) => eventListener.verifyOtp(e, config),
    );


  document.querySelector('div[name="resend-via-msg"]')
    .addEventListener('click', async () => eventListener.resendOtp());
  const resendVoice = document.querySelector('div[name="resend-via-voice"]');
  if (resendVoice) {
    resendVoice.addEventListener('click', async () => {
      await eventListener.resendOtp(true);
    });
  }
  document.querySelector('div[name="back"]')
    .addEventListener('click', () => {
      utils.toggleScreens([otpFormId, signupFormId]);
    });

  const inputFields = document.querySelectorAll(inputFieldSelector);
  const handleInvalidEvent = (event) => {
    event.target?.scrollIntoView(false);
  };

  inputFields.forEach(field => {
    field.addEventListener('invalid', handleInvalidEvent);
  });
}

export default {
  initialize: initializeForm,
};
