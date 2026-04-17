import {
  CONFIRM_EMAIL_ERROR,
  LOGIN_EMAIL_INTENT,
  LOGIN_MOBILE_INTENT,
  SIGN_UP_INTENT,
  SIGN_UP_OTP_INTENT,
  LOGIN_MOBILE_OTP_INTENT,
} from '@common/vanilla_ui/auth/utils/constants';
import {
  Form, FormFlow, PhoneInput, Modal, TermsConsent,
  FocusOTPInput, SingularOTPAutofill,
} from '@common/vanilla_ui/general';
import { FlowTypes } from '@common/vanilla_ui/general/formFlow';
import { OtpForm } from '@common/vanilla_ui/forms';
import { welcomeModalEvents } from '@common/vanilla_ui/general/welcomeModal';
import gtmTracking from '@common/vanilla_ui/tracking/gtm';
import {
  getAttribution,
  setAttribution,
} from '@common/vanilla_ui/tracking/attribution';
import { isScalerWebApp } from '@common/utils/platform';
import { retryWithRecaptchaV2Params } from '@common/utils/recaptcha';
import { shouldUseShortOtp } from '@common/utils/otp';

const defaultErrorMessage = 'Something went wrong! Please try again later';
const formHandlers = {
  register: '_registerHandler',
  'register-otp': '_registerOtpHandler',
  'login-mobile': '_loginMobileHandler',
  'login-otp': '_loginOtpHandler',
  'login-email': '_loginEmailHandler',
  'update-mobile': '_updateMobileHandler',
  'update-mobile-otp': '_updateMobileOtpHandler',
};

/**
 * The flow for integrating the login/signup modals:
 * *For Predefined Handlers:*
 *  1) Initialise new Auth Flow object using (Default Mode will be register
 *      and all handlers will be initialised automatically):
 *        new AuthFlow('auth-modal');
 *         ** If you have to make default mode to be login-mobile:
 *           new AuthFlow('auth-modal', 'login-mobile');
 * *For Custom Handlers:*
 *  1) Initialise new Auth Flow object using (Default Mode will be register):
 *      const auth = new AuthFlow('auth-modal', 'register', false);
 *        // false to stop auto initialisation of handlers
 *        // used to set custom handlers
 *      ** If you have to make default mode to be login-mobile:
 *         const auth = new AuthFlow('auth-modal', 'login-mobile', false);
 *  2) First set your custom login/signup handlers by using:
 *      auth.setCustomFormHandler(
 *        'register', registerHandler       //for custom register handler
 *      );
 *      auth.setCustomFormHandler(
 *        'login-mobile', loginMobileHandler  //for custom login-mobile handler
 *      );
 *  3) Once all the custom handlers are set then initialise all the handlers:
 *      auth.authFlowInitialize();
 */

class AuthFlow extends FormFlow {
  constructor(id, waitTime = 3000, mode = 'register', autoInitialise = true) {
    const formType = isScalerWebApp() ? FlowTypes.modal : FlowTypes.app;
    super('auth', id, formType, mode);
    this._waitTime = waitTime;
    this._setFormHandlers();
    if (autoInitialise) this.authFlowInitialize();
  }

  setCustomFormHandler(mode, handler) {
    this.setFormHandler(mode, handler);
  }

  /**
   * Called separately as to provide flexibility for declaring custom handlers
   */
  authFlowInitialize() {
    this.initialize();
  }
  /* Private */

  setFormAttribution = (intent) => {
    setAttribution(
      intent,
      {
        program: getAttribution()?.program || null,
      },
    );

    return getAttribution();
  };

  _setFormHandlers() {
    Object.keys(formHandlers).forEach(mode => {
      this.setFormHandler(mode, this[formHandlers[mode]]);
    });
  }

  /* Form handlers */

  _registerHandler = (el) => {
    const form = new Form(el, {
      method: 'POST',
      endpoint: '/users/v2/',
      createPayload: ({
        product,
        email,
        name,
        // eslint-disable-next-line camelcase
        phone_number,
        orgyear,
        // eslint-disable-next-line camelcase
        terms_consent,
        // eslint-disable-next-line camelcase
        whatsapp_consent,
        'cf-turnstile-response': turnstileResponse,
      }) => ({
        user: {
          email,
          name,
          phone_number,
          orgyear,
          terms_consent,
          whatsapp_consent,
        },
        type: product,
        'cf-turnstile-response': turnstileResponse,
        attributions: this.setFormAttribution(
          getAttribution().intent || SIGN_UP_INTENT,
        ),
        short_otp: shouldUseShortOtp(),
        ...retryWithRecaptchaV2Params(el.id),
      }),
      validations: {
        phone_number: 'mobile',
        email: 'email',
      },
    });

    TermsConsent.initialize();

    let otpVoiceForm = null;
    if (document.getElementById('register-otp-voice-resend-form')) {
      const otpVoiceFormEl = document
        .getElementById('register-otp-voice-resend-form');
      otpVoiceForm = new OtpForm(otpVoiceFormEl, {
        method: 'POST',
        endpoint: '/users/v2/account/voice',
        createPayload: (values) => ({
          user: values,
          short_otp: shouldUseShortOtp(),
        }),
      });
      otpVoiceForm.initialize();

      otpVoiceForm.on('submitted', () => {
      });
    }

    form.on('initialize', () => {
      new PhoneInput('register-mobile');
    });

    form.on('submitted', () => {
      gtmTracking.sendFormSubmitStatus('register-form', true);
      if (this._commonTrackingContext?.leadIp) {
        gtmTracking.sendCustomClick('lead_gen_request', {
          ip: this._commonTrackingContext?.leadIp,
          source: this._commonTrackingContext?.leadSource,
          section: this._commonTrackingContext?.leadSection,
        });
      }
      const phoneNumber = form.getFieldValue('phone_number');
      const email = form.getFieldValue('email');

      const registerOtpForm = this.getForm('register-otp');
      registerOtpForm.updateField('phone_number', phoneNumber);
      registerOtpForm.updateField('email', email);

      if (otpVoiceForm) {
        otpVoiceForm.updateField('phone_number', phoneNumber);
        otpVoiceForm.updateField('email', email);
        otpVoiceForm.reset();
      }

      this.switchMode('register-otp');
      // Auto-Fill OTP Feature
      SingularOTPAutofill('register_otp_form_otp_input');
      // Focus OTP Field in m-web
      FocusOTPInput('register-otp-form', 'register_otp_form_otp_input');
    });

    form.on('error', (error) => {
      let message = defaultErrorMessage;
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
          case 409:
            message = 'Phone number already registered';
            break;
          case 406:
            message = 'Recaptcha error';
            window.fallbackVisibleTurnstile(el.id);
            break;
          default:
          // Do nothing
        }
        gtmTracking.sendFormSubmitStatus('register-form', false, message);
        if (this._commonTrackingContext?.leadIp) {
          gtmTracking.sendCustomClick('lead_gen_request_error', {
            ip: this._commonTrackingContext?.leadIp,
            source: this._commonTrackingContext?.leadSource,
            section: this._commonTrackingContext?.leadSection,
          });
        }
      }
      form.setError(message);
    });

    form.initialize();

    return form;
  }

  _registerOtpHandler = (el) => {
    const form = new Form(el, {
      method: 'POST',
      endpoint: '/users/v2/verify',
      createPayload: (values) => ({
        user: values,
        attributions: this.setFormAttribution(SIGN_UP_OTP_INTENT),
      }),
    });

    form.on('submitted', () => {
      gtmTracking.sendFormSubmitStatus('register-otp-form', true);
      if (this._commonTrackingContext?.leadIp) {
        gtmTracking.sendCustomClick('lead_gen', {
          ip: this._commonTrackingContext?.leadIp,
          source: this._commonTrackingContext?.leadSource,
          section: this._commonTrackingContext?.leadSection,
        });
      }
      Modal.close(this._id);
      welcomeModalEvents.emit('show');
      setTimeout(() => {
        this.complete();
      }, this._waitTime);
    });

    form.on('error', error => {
      let message = defaultErrorMessage;
      if (error && error.isFromServer) {
        switch (error.response.status) {
          case 404:
            message = 'User does not exist!';
            break;
          case 401:
            message = 'OTP you entered is incorrect';
            break;
          default:
          // Do nothing
        }
        gtmTracking.sendFormSubmitStatus('register-otp-form', false, message);
        if (this._commonTrackingContext?.leadIp) {
          gtmTracking.sendCustomClick('lead_gen_error', {
            ip: this._commonTrackingContext?.leadIp,
            source: this._commonTrackingContext?.leadSource,
            section: this._commonTrackingContext?.leadSection,
          });
        }
      }
      form.setError(message);
    });

    form.initialize();

    return form;
  }

  _loginMobileHandler = (el) => {
    const form = new Form(el, {
      method: 'POST',
      endpoint: '/users/v2/sessions',
      createPayload: ({
        // eslint-disable-next-line camelcase
        phone_number,
        'cf-turnstile-response': turnstileResponse,
      }) => ({
        user: {
          phone_number,
        },
        'cf-turnstile-response': turnstileResponse,
        attributions: this.setFormAttribution(
          getAttribution().intent || LOGIN_MOBILE_INTENT,
        ),
        short_otp: shouldUseShortOtp(),
      }),
      validations: {
        phone_number: 'mobile',
      },
    });

    let otpVoiceForm = null;
    if (document.getElementById('login-otp-voice-resend-form')) {
      const otpVoiceFormEl = document
        .getElementById('login-otp-voice-resend-form');
      otpVoiceForm = new OtpForm(otpVoiceFormEl, {
        method: 'POST',
        endpoint: '/users/v2/sessions/voice',
        createPayload: (values) => ({
          user: values,
          short_otp: shouldUseShortOtp(),
        }),
      });
      otpVoiceForm.initialize();

      otpVoiceForm.on('submitted', () => {
      });
    }

    form.on('initialize', () => {
      new PhoneInput('login-mobile');
    });

    form.on('submitted', () => {
      gtmTracking.sendFormSubmitStatus('login-mobile-form', true);
      if (this._commonTrackingContext?.leadIp) {
        gtmTracking.sendCustomClick('lead_gen_request', {
          ip: this._commonTrackingContext?.leadIp,
          source: this._commonTrackingContext?.leadSource,
          section: this._commonTrackingContext?.leadSection,
        });
      }
      const phoneNumber = form.getFieldValue('phone_number');
      const loginOtpForm = this.getForm('login-otp');
      loginOtpForm.updateField('phone_number', phoneNumber);

      if (otpVoiceForm) {
        otpVoiceForm.updateField('phone_number', phoneNumber);
        otpVoiceForm.reset();
      }
      this.switchMode('login-otp');
      // Auto-Fill OTP Feature
      SingularOTPAutofill('login_otp_form_otp_input');
      // Focus OTP Field in m-web
      FocusOTPInput('login-otp-form', 'login_otp_form_otp_input');
    });

    form.on('error', (error) => {
      let message = defaultErrorMessage;
      if (error && error.isFromServer) {
        switch (error.response.status) {
          case 404:
            message = 'Mobile number is not associated with any account';
            break;
          case 429:
            message = 'Request rate exceeded, please try after sometime';
            break;
          case 422:
            message = error.responseJson?.message || defaultErrorMessage;
            window.fallbackVisibleTurnstile(el.id);
            break;
          default:
          // Do nothing
        }
        gtmTracking.sendFormSubmitStatus('login-mobile-form', false, message);
        if (this._commonTrackingContext?.leadIp) {
          gtmTracking.sendCustomClick('lead_gen_request_error', {
            ip: this._commonTrackingContext?.leadIp,
            source: this._commonTrackingContext?.leadSource,
            section: this._commonTrackingContext?.leadSection,
          });
        }
      }

      form.setError(message);
    });

    form.initialize();

    return form;
  }

  _loginOtpHandler = (el) => {
    const form = new Form(el, {
      method: 'POST',
      endpoint: '/users/v2/sessions/verify',
      createPayload: (values) => ({
        user: values,
        attributions: this.setFormAttribution(LOGIN_MOBILE_OTP_INTENT),
      }),
    });

    form.on('submitted', () => {
      gtmTracking.sendFormSubmitStatus('login-otp-form', true);
      if (this._commonTrackingContext?.leadIp) {
        gtmTracking.sendCustomClick('lead_gen', {
          ip: this._commonTrackingContext?.leadIp,
          source: this._commonTrackingContext?.leadSource,
          section: this._commonTrackingContext?.leadSection,
        });
      }
      this.complete();
    });

    form.on('error', error => {
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
          switch (error.response.status) {
            case 404:
              message = 'Mobile number is not associated with any account';
              break;
            case 401:
              message = 'OTP you entered is incorrect';
              break;
            case 422:
              message = error.responseJson?.message || CONFIRM_EMAIL_ERROR;
              break;
            default:
            // Do nothing
          }
        }
        gtmTracking.sendFormSubmitStatus('login-otp-form', false, message);
        if (this._commonTrackingContext?.leadIp) {
          gtmTracking.sendCustomClick('lead_gen_error', {
            ip: this._commonTrackingContext?.leadIp,
            source: this._commonTrackingContext?.leadSource,
            section: this._commonTrackingContext?.leadSection,
          });
        }
      }
      form.setError(message);
    });

    form.initialize();

    return form;
  }

  _loginEmailHandler = (el) => {
    const form = new Form(el, {
      method: 'POST',
      endpoint: '/users/sign_in/',
      createPayload: ({
        email,
        password,
        'cf-turnstile-response': turnstileResponse,
      }) => ({
        user: {
          email,
          password,
        },
        'cf-turnstile-response': turnstileResponse,
        attributions: this.setFormAttribution(
          getAttribution().intent || LOGIN_EMAIL_INTENT,
        ),
      }),
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
          switch (error.response.status) {
            case 401:
              message = 'Email address or password is incorrect.';
              break;
            case 422:
              message = error.responseJson?.message || 'Something went wrong';
              window.fallbackVisibleTurnstile(el.id);
              break;
            default:
            // Do nothing
          }
        }
        gtmTracking.sendFormSubmitStatus('login-email-form', false, message);
      }
      form.setError(message);
    });

    form.on('submitted', () => {
      gtmTracking.sendFormSubmitStatus('login-email-form', true);
      this.complete();
    });

    form.initialize();

    return form;
  }

  _updateMobileHandler = el => {
    const form = new Form(el, {
      method: 'POST',
      endpoint: '/users/v2/account/otp',
      createPayload: values => ({ user: values }),
      validations: { phone_number: 'mobile' },
    });

    const otpFormEl = document.getElementById('update-mobile-resend-form');
    const otpForm = new OtpForm(otpFormEl, {
      method: 'POST',
      endpoint: '/users/v2/account/otp',
      createPayload: values => ({ user: values }),
    });
    otpForm.initialize();

    let otpVoiceForm = null;
    if (document.getElementById('update-mobile-voice-resend-form')) {
      const otpVoiceFormEl = document
        .getElementById('update-mobile-voice-resend-form');
      otpVoiceForm = new OtpForm(otpVoiceFormEl, {
        method: 'POST',
        endpoint: '/users/v2/account/voice',
        createPayload: values => ({
          user: values,
          short_otp: shouldUseShortOtp(),
        }),
      });
      otpVoiceForm.initialize();

      otpForm.on('submitted', () => {
        otpVoiceForm.reset();
      });

      otpVoiceForm.on('submitted', () => {
        otpForm.reset();
      });
    }

    form.on('initialize', () => {
      new PhoneInput('update-mobile');
    });

    form.on('submitted', () => {
      gtmTracking.sendFormSubmitStatus('update-mobile-form', true);
      const phoneNumber = form.getFieldValue('phone_number');
      const email = form.getFieldValue('email');
      const updateMobileOtpForm = this.getForm('update-mobile-otp');
      updateMobileOtpForm.updateField('phone_number', phoneNumber);
      updateMobileOtpForm.updateField('email', email);

      otpForm.updateField('phone_number', phoneNumber);
      otpForm.updateField('email', email);
      otpForm.reset();

      if (otpVoiceForm) {
        otpVoiceForm.updateField('phone_number', phoneNumber);
        otpVoiceForm.updateField('email', email);
        otpVoiceForm.reset();
      }
      this.switchMode('update-mobile-otp');
    });

    form.on('error', error => {
      let message = defaultErrorMessage;
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
          case 409:
            message = 'Phone number already registered';
            break;
          default:
          // Do nothing
        }
        gtmTracking.sendFormSubmitStatus('update-mobile-form', false, message);
      }

      form.setError(message);
    });

    form.initialize();

    return form;
  }

  _updateMobileOtpHandler = el => {
    const form = new Form(el, {
      method: 'POST',
      endpoint: '/users/v2/account/verify',
      createPayload: values => ({ user: values }),
    });

    form.on('submitted', () => {
      gtmTracking.sendFormSubmitStatus('update-mobile-otp-form', true);
      this.complete();
    });

    form.on('error', error => {
      let message = defaultErrorMessage;
      if (error && error.isFromServer) {
        switch (error.response.status) {
          case 404:
            message = 'Mobile number is not associated with any account';
            break;
          case 403:
            message = 'OTP you entered is incorrect';
            break;
          case 422:
            message = 'Email unconfirmed. Please confirm your Email.';
            break;
          default:
          // Do nothing
        }
        gtmTracking.sendFormSubmitStatus(
          'update-mobile-otp-form', false, message,
        );
      }
      form.setError(message);
    });

    form.initialize();

    return form;
  }
}

export default AuthFlow;
