import {
  SIGN_UP_INTENT,
  CONFIRM_EMAIL_ERROR,
  SIGN_UP_OTP_INTENT,
  LOGIN_EMAIL_INTENT,
  LOGIN_MOBILE_INTENT,
  FORM_MODES,
  ERRORS,
  LOGIN_MOBILE_OTP_INTENT,
} from './constant';
import { FlowTypes } from '@common/vanilla_ui/general/formFlow';
import {
  Form,
  FormFlow,
  PhoneInput,
  SingularOTPAutofill,
  FocusOTPInput,
} from '@common/vanilla_ui/general';
import {
  getAttribution,
  setAttribution,
} from '@common/vanilla_ui/tracking/attribution';
import SignupDialogTracker from './tracking';
import gtmTracking from '@common/vanilla_ui/tracking/gtm';

import { retryWithRecaptchaV2Params } from '@common/utils/recaptcha';

const defaultErrorMessage = 'Something went wrong! Please try again later';

const formHandlers = {
  [FORM_MODES.signup]: '_registerHandler',
  [FORM_MODES.mobileLogin]: '_mobileLoginHandler',
  [FORM_MODES.emailLogin]: '_emailLoginHandler',
  [FORM_MODES.signupOtp]: '_signupOtpHandler',
  [FORM_MODES.loginOtp]: '_loginOtpHandler',
};

class SignupDialogForm extends FormFlow {
  constructor(
    id,
    config = {},
    waitTime = 3000,
    mode = FORM_MODES.signup,
    autoInitialise = true,
  ) {
    super('signup-dialog-form', id, FlowTypes.modal, mode);
    this._waitTime = waitTime;
    this._setFormHandlers();
    this.config = {
      preventAutoRedirect: false,
      ...config,
    };

    if (autoInitialise) this.modalAuthFormInitialize();
    this._tracker = new SignupDialogTracker('signup-dialog-form');
  }

  setFormAttribution = (intent) => {
    setAttribution(intent, { program: getAttribution()?.program || null });

    return getAttribution();
  };

  modalAuthFormInitialize() {
    this.initialize();
  }

  _setFormHandlers() {
    Object.keys(formHandlers).forEach((mode) => {
      // setFormHandler is a method inside FormFlow
      this.setFormHandler(mode, this[formHandlers[mode]]);
    });
  }

  _registerHandler = (el) => {
    const form = new Form(el, {
      method: 'POST',
      endpoint: '/users/v2',
      createPayload: (payload = {}) => {
        const {
          product,
          email,
          name,
          phone_number: phoneNumber,
          orgyear,
          terms_consent: termsConsent,
          whatsapp_consent: consent,
          'cf-turnstile-response': turnstileResponse,
        } = payload;

        return {
          user: {
            email,
            name,
            phone_number: phoneNumber,
            orgyear,
            terms_consent: termsConsent,
            whatsapp_consent: consent,
          },
          type: product,
          'cf-turnstile-response': turnstileResponse,
          attributions: this.setFormAttribution(
            getAttribution().intent || SIGN_UP_INTENT,
          ),
          ...retryWithRecaptchaV2Params(el.id),
        };
      },
      validations: {
        phone_number: 'mobile',
        email: 'email',
      },
    });

    form.on('initialize', () => {
      new PhoneInput('register-v2-mobile');
    });

    form.on('submit', () => {
      this._tracker.formStatus(`${FORM_MODES.signup}-submit`);
    });

    form.on('submitted', () => {
      this._tracker.formStatus(`${FORM_MODES.signup}-submitted`);
      const registerOtpForm = this.getForm(FORM_MODES.signupOtp);
      const phoneNumber = form.getFieldValue('phone_number');
      const email = form.getFieldValue('email');

      registerOtpForm.updateField('phone_number', phoneNumber);
      registerOtpForm.updateField('email', email);

      if (this._commonTrackingContext?.leadIp) {
        gtmTracking.sendCustomClick('lead_gen_request', {
          ip: this._commonTrackingContext?.leadIp,
          source: this._commonTrackingContext?.leadSource,
          section: this._commonTrackingContext?.leadSection,
        });
      }

      this.switchMode(FORM_MODES.signupOtp);
    });

    form.on('error', (error) => {
      let message = defaultErrorMessage;
      if (error && error.isFromServer) {
        const { status } = error.response || {};
        message = ERRORS[FORM_MODES.signup][status]
          || message;

        if (status === 406) {
          window.fallbackVisibleTurnstile(el.id);
        }
      }

      this._tracker.formStatus(`${FORM_MODES.signup}-error`, {
        click_text: message,
      });
      if (this._commonTrackingContext?.leadIp) {
        gtmTracking.sendCustomClick('lead_gen_request_error', {
          ip: this._commonTrackingContext?.leadIp,
          source: this._commonTrackingContext?.leadSource,
          section: this._commonTrackingContext?.leadSection,
        });
      }
      form.setError(message);
    });

    form.initialize();

    return form;
  };

  _mobileLoginHandler = (el) => {
    const form = new Form(el, {
      method: 'POST',
      endpoint: '/users/v2/sessions',
      createPayload: (payload = {}) => {
        const {
          phone_number: phoneNumber,
          'cf-turnstile-response': turnstileResponse,
        } = payload;

        return {
          user: {
            phone_number: phoneNumber,
          },
          'cf-turnstile-response': turnstileResponse,
          attributions: this.setFormAttribution(
            getAttribution().intent || LOGIN_MOBILE_INTENT,
          ),
        };
      },
      validations: {
        phone_number: 'mobile',
      },
    });

    form.on('initialize', () => {
      new PhoneInput('mobile-login-phone-number');
    });

    form.on('submit', () => {
      this._tracker.formStatus(`${FORM_MODES.mobileLogin}-submit`);
    });

    form.on('submitted', () => {
      this._tracker.formStatus(`${FORM_MODES.mobileLogin}-submitted`);
      const phoneNumber = form.getFieldValue('phone_number');
      const loginOtpForm = this.getForm(FORM_MODES.loginOtp);
      loginOtpForm.updateField('phone_number', phoneNumber);

      this.switchMode(FORM_MODES.loginOtp);

      SingularOTPAutofill('login_otp_v2_form_otp_input');
      FocusOTPInput('login-otp-form-v2', 'login_otp_v2_form_otp_input');
    });
    form.on('error', (error) => {
      let message = defaultErrorMessage;
      if (error && error.isFromServer) {
        const { status } = error.response || {};
        if (status === 422) {
          window.fallbackVisibleTurnstile(el.id);
          message = error.responseJson?.message || defaultErrorMessage;
        } else {
          message = ERRORS[FORM_MODES.mobileLogin][status] || message;
        }
      }

      this._tracker.formStatus(`${FORM_MODES.mobileLogin}-error`, {
        click_text: message,
      });
      form.setError(message);
    });

    form.initialize();

    return form;
  };

  _emailLoginHandler = (el) => {
    const form = new Form(el, {
      method: 'POST',
      endpoint: '/users/sign_in/',
      createPayload: (payload = {}) => {
        const {
          email,
          password,
          'cf-turnstile-response': turnstileResponse,
        } = payload;

        return {
          user: {
            email,
            password,
          },
          'cf-turnstile-response': turnstileResponse,
          attributions: this.setFormAttribution(
            getAttribution().intent || LOGIN_EMAIL_INTENT,
          ),
        };
      },
    });

    form.on('submit', () => {
      this._tracker.formStatus(`${FORM_MODES.emailLogin}-submit`);
    });

    form.on('error', (error) => {
      let message = defaultErrorMessage;
      if (error && error.isFromServer) {
        if (
          error.responseJson?.signature
          && error.responseJson.error_code === 'session_limit_exceeded'
        ) {
          message = 'Session Limit Exceeded!';
          window.location = `${window.location.origin}`
            + '/users/session-management/?signature='
            + `${error.responseJson?.signature}`;
        } else {
          const { status } = error.response || {};
          if (status === 422) {
            message = error.responseJson?.message || defaultErrorMessage;
            window.fallbackVisibleTurnstile(el.id);
          } else {
            message = ERRORS[FORM_MODES.emailLogin][status] || message;
          }
        }
      }

      this._tracker.formStatus(`${FORM_MODES.emailLogin}-error`, {
        click_text: message,
      });
      form.setError(message);
    });

    form.on('submitted', () => {
      this._tracker.formStatus(`${FORM_MODES.emailLogin}-submitted`);

      if (this.config.preventAutoRedirect) return;
      setTimeout(() => {
        this.complete();
      }, this._waitTime);
    });

    form.initialize();

    return form;
  };

  _signupOtpHandler = (el) => {
    const form = new Form(el, {
      method: 'POST',
      endpoint: '/users/v2/verify',
      createPayload: (values) => ({
        user: values,
        attributions: this.setFormAttribution(SIGN_UP_OTP_INTENT),
      }),
    });

    form.on('error', error => {
      let message = defaultErrorMessage;
      if (error && error.isFromServer) {
        const { status } = error.response || {};
        message = ERRORS[FORM_MODES.signupOtp][status] || message;
      }

      if (this._commonTrackingContext?.leadIp) {
        gtmTracking.sendCustomClick('lead_gen_error', {
          ip: this._commonTrackingContext?.leadIp,
          source: this._commonTrackingContext?.leadSource,
          section: this._commonTrackingContext?.leadSection,
        });
      }

      form.setError(message);
    });
    form.on('submit', () => {
      this._tracker.formStatus(`${FORM_MODES.emailLogin}-submit`);
    });

    form.on('submitted', () => {
      this._tracker.formStatus(`${FORM_MODES.signupOtp}-submitted`);
      if (this._commonTrackingContext?.leadIp) {
        gtmTracking.sendCustomClick('lead_gen', {
          ip: this._commonTrackingContext?.leadIp,
          source: this._commonTrackingContext?.leadSource,
          section: this._commonTrackingContext?.leadSection,
        });
      }

      if (this.config.preventAutoRedirect) return;
      setTimeout(() => {
        this.complete();
      }, this._waitTime);
    });

    form.initialize();

    return form;
  };

  _loginOtpHandler = (el) => {
    const form = new Form(el, {
      method: 'POST',
      endpoint: '/users/v2/sessions/verify',
      createPayload: (values) => ({
        user: values,
        attributions: this.setFormAttribution(LOGIN_MOBILE_OTP_INTENT),
      }),
    });

    form.on('submit', () => {
      this._tracker.formStatus(`${FORM_MODES.loginOtp}-submit`);
    });

    form.on('submitted', () => {
      this._tracker.formStatus(`${FORM_MODES.loginOtp}-submitted`);

      if (this.config.preventAutoRedirect) return;
      setTimeout(() => {
        this.complete();
      }, this._waitTime);
    });

    form.on('error', (error) => {
      let message = defaultErrorMessage;
      if (error && error.isFromServer) {
        if (
          error.responseJson?.signature
          && error.responseJson.error_code === 'session_limit_exceeded'
        ) {
          message = 'Session Limit Exceeded!';
          window.location = `${window.location.origin}`
            + '/users/session-management/?signature='
            + `${error.responseJson?.signature}`;
        } else {
          const { status } = error.response || {};
          if (status === 422) {
            message = error.responseJson?.message || CONFIRM_EMAIL_ERROR;
          } else {
            message = ERRORS[FORM_MODES.loginOtp][status] || message;
          }
        }
      }

      this._tracker.formStatus(`${FORM_MODES.loginOtp}-error`, {
        click_text: message,
      });
      form.setError(message);
    });

    form.initialize();

    return form;
  };
}

export default SignupDialogForm;
