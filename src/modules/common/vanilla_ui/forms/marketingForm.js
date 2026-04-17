import { bookLiveClass } from '@common/vanilla_ui/forms/bookLiveClass';
import {
  getAttribution,
  setAttribution,
} from '@common/vanilla_ui/tracking/attribution';
import { OtpForm, RegisterForm } from '@common/vanilla_ui/forms/handlers';
import {
  PhoneInput, FormFlow, Form, FocusOTPInput, SingularOTPAutofill,
} from '@common/vanilla_ui/general';
import { ResendOtpForm } from '@common/vanilla_ui/forms';
import BookLiveClassSlot from '@common/vanilla_ui/forms/bookLiveClassSlot';
import FormTracker from '@common/vanilla_ui/forms/tracking/formTracker';
import gtmTracking from '@common/vanilla_ui/tracking/gtm';
import trackOtpFill from '@common/vanilla_ui/tracking/actions/trackOtpFill';

const PROGRAMS = {
  'software-engineering': 'software_development',
  'data-science': 'data_science',
};

const RECORDED_CLASS_EVENTS = {
  academy: '2373',
  'data-science': '2378',
};

const DEFAULT_PROGRAM_TYPE = 'software-engineering';
const DATA_SCIENCE_LANDING_PAGE = 'data-science-course';
const NEOVARSITY_LANDING_PAGE = 'neovarsity';
const DEFAULT_LANDING_PAGE = 'scaler-landing';
const NEOVARSITY_PROGRAM_INPUT_ID = 'neovarsity-degree-specialization';

let loggedIn = false;
const freeLiveRecordedClass = window.__FLRC__ === 'true';
let registrationTracking = null;

const track = (eventName, eventType = 'click', value = null) => {
  if (window.storeEsEvent) {
    window.storeEsEvent(
      `marketing-form-${eventName}`, eventType, value,
    );
  }
};

const setFormAttribution = (intent, programType) => {
  setAttribution(intent, {
    program: PROGRAMS[programType] || 'software_development',
  });

  return getAttribution();
};

const getCurrentLandingPage = () => {
  const { pathname } = window.location;
  const url = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const urlPathArrs = url.split('/');

  if (urlPathArrs.includes(DATA_SCIENCE_LANDING_PAGE)) {
    return DATA_SCIENCE_LANDING_PAGE;
  } else if (urlPathArrs.includes(NEOVARSITY_LANDING_PAGE)) {
    return NEOVARSITY_LANDING_PAGE;
  }

  return DEFAULT_LANDING_PAGE;
};

const getProgramType = () => {
  const currentLandingPage = getCurrentLandingPage();

  if (currentLandingPage === DATA_SCIENCE_LANDING_PAGE) {
    return 'data-science';
  } else if (currentLandingPage === NEOVARSITY_LANDING_PAGE) {
    const {
      value: programType,
    } = document.getElementById(NEOVARSITY_PROGRAM_INPUT_ID);

    return programType;
  }

  return DEFAULT_PROGRAM_TYPE;
};

const getPayload = (values) => {
  const programType = getProgramType();
  const attributions = setFormAttribution('marketing_form', programType);

  const {
    email,
    phone_number: phoneNumber,
    otp,
  } = values;

  return {
    user: {
      email,
      phone_number: phoneNumber,
      otp,
      type: 'academy',
      skip_existing_user_check: true,
    },
    attributions,
  };
};

const initializeInputs = () => {
  new PhoneInput('marketing-form__phone');
  registrationTracking = new FormTracker('marketing-form-submit');
};

const setupMainForm = ({ postAccountVerifyAction }) => {
  const formId = 'marketing-form';
  const recaptchaSelector = '.g-recaptcha';
  const otpInput = document.getElementById(
    'marketing-form__otp',
  );

  const form = new FormFlow(
    'marketing-form', 'marketing-form', 'page', 'register',
  );

  const formFlowEl = document.querySelector('#marketing-form');
  loggedIn = formFlowEl.getAttribute('data-logged-in') === 'true';

  const programEl = document.querySelector('div[data-program]');
  const program = programEl ? programEl.getAttribute(
    'data-program',
  ) : 'academy';

  const handleSuccessfullBooking = () => {
    if (program === 'neovarsity') return;

    localStorage.setItem('event_registered', JSON.stringify({
      registered: true,
      event: `${window.location.pathname}`,
    }));
  };

  trackOtpFill({ otpInputId: `${formId}__otp` });

  form.setFormHandler('register', element => {
    const { otpMsgForm, otpVoiceForm } = ResendOtpForm.initialize(
      'marketing-form', track,
    );
    const otpFormId = 'marketing-form-otp';
    const otpForm = new Form(
      document.getElementById(otpFormId),
      {
        method: loggedIn ? 'PUT' : 'POST',
        endpoint: loggedIn ? '/users/v2/account' : '/users/v2/',
        createPayload: values => ({
          user: {
            ...values,
            skip_existing_user_check: true,
          },
          type: 'marketing',
          account_type:
            programEl && programEl.checked && programEl.value === 'academy'
              ? 'academy' : 'data_science',
          'cf-turnstile-response': values['cf-turnstile-response'],
          attributions: setFormAttribution(
            'marketing_form_pre_otp', getProgramType(),
          ),
        }),
        validations: {
          phone_number: 'mobile',
          orgyear: 'required',
        },
      },
    );

    const registerForm = new Form(element, {
      method: 'POST',
      endpoint: loggedIn ? '/users/v2/account/verify' : '/users/v2/verify',
      createPayload: getPayload,
    });

    const registerFormSubmitCb = () => {
      registerForm.updateField(
        'otp', otpInput.value,
      );
    };


    const registerFormSubmittedCb = () => {
      gtmTracking.sendFormSubmitStatus('marketing-form-submit', true);
      registrationTracking.formStatusTracking(
        `scaler-landing-marketing-form-submit-${program}-success`,
        { success_message: 'Successfully submitted OTP and form' },
      );
      registerForm.setDisabled(true);

      postAccountVerifyAction();

      if (program === 'neovarsity') {
        return;
      }

      if (BookLiveClassSlot.checkEligibility('data-science')) {
        form.switchMode('book-live-class');
      } else if (freeLiveRecordedClass) {
        bookLiveClass(
          program, RECORDED_CLASS_EVENTS[program], handleSuccessfullBooking,
        );
      } else {
        bookLiveClass(program, undefined, handleSuccessfullBooking);
      }

      track(
        'register-step-complete', 'click',
        registerForm.getFieldValue('email'),
      );
      track('open-dashboard', 'click');
    };

    const otpFormSubmittedCb = () => {
      // to enable autofill for only ds
      if (getProgramType() !== 'data-science') return;
      registrationTracking.formStatusTracking(
        `scaler-landing-marketing-form-otp-submit-${program}-success`,
        { success_message: 'Successfully submitted OTP and form' },
      );

      // Auto-Fill OTP Feature
      SingularOTPAutofill('marketing-form__otp');
      // Focus OTP Field in m-web
      FocusOTPInput('marketing-form-submit', 'marketing-form__otp');
    };

    const enableOtpForm = () => {
      const formEl = document.getElementById(formId);
      document
        .querySelector(`.${formId}__otp-input`)
        .classList.remove('hidden');
      document
        .querySelector(`.${formId}__otp-label`)
        ?.classList?.remove('hidden');
      document
        .querySelector(`.${formId}__otp-submit`)
        .classList.add('hidden');
      document
        .querySelector(`.${formId}__otp-container`)
        .classList.add(`${formId}__otp-container--active`);
      document
        .querySelector(`.${formId}__phone-hint`)
        .classList.add('hidden');
      document
        .querySelector(`.${formId}__otp-hint`)
        .classList.remove('hidden');
      (formEl.querySelector(recaptchaSelector) || document
        .getElementById(`${formId}-recaptcha`))?.classList.add('hidden');
      track('get-otp', 'click', otpForm.getFieldValue('email'));
      window.removeFormTurnstile(otpFormId);
    };

    OtpForm.initialize({
      registerForm,
      otpVoiceForm,
      otpMsgForm,
      initializeInputs,
      parentFormId: formId,
      formId: 'marketing-form-otp',
      track,
      otpForm,
      submittedCallback: otpFormSubmittedCb,
      enableOtpForm,
      program,
    });

    RegisterForm.initialize({
      registerForm,
      formId,
      submitCallback: registerFormSubmitCb,
      submittedCallback: registerFormSubmittedCb,
    });

    if (!loggedIn) {
      registerForm.setDisabled(true);
    }
  });

  form.setFormHandler('book-live-class', () => {
    BookLiveClassSlot.initializeBookLiveClassWidget(
      'data_science',
      form,
      'landing-auth-form-booked-class',
    );
  });

  form.setFormHandler('booked-live-class', () => {
    BookLiveClassSlot.initializeBookedLiveClassWidget(
      'data-science', form, handleSuccessfullBooking,
    );
  });

  form.initialize();
};

const noop = () => {};

const initialize = ({
  postAccountVerifyAction = noop,
} = {}) => {
  const mfe = document.querySelectorAll('.marketing-form .inputText');

  mfe.forEach(el => {
    if (el.value !== '') {
      el.classList.add('focus-visible');
    }

    el.addEventListener('blur', () => {
      if (el.value !== '') {
        el.classList.add('focus-visible');
      } else {
        el.classList.remove('focus-visible');
      }
    });
  });
  if (mfe.length) {
    setupMainForm({ postAccountVerifyAction });
  }
};

export default { initialize };
