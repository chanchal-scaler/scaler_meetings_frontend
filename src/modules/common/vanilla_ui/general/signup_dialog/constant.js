export const SIGN_UP_INTENT = 'signup_dialog';
export const SIGN_UP_OTP_INTENT = 'signup_otp_dialog';
export const LOGIN_EMAIL_INTENT = 'email_login_dialog';
export const LOGIN_MOBILE_INTENT = 'mobile_login_dialog';
export const LOGIN_MOBILE_OTP_INTENT = 'mobile_login_otp_dialog';

export const CONFIRM_EMAIL_ERROR = `Email unconfirmed.
 Please confirm your Email.`;

export const FORM_MODES = {
  signup: 'signup',
  mobileLogin: 'mobile-login',
  emailLogin: 'email-login',
  signupOtp: 'signup-otp',
  loginOtp: 'login-otp',
};

export const ERRORS = {
  [FORM_MODES.signup]: {
    429: 'Request rate exceeded, please try after sometime',
    422: 'Please fill the required fields',
    403: 'Email already registered',
    409: 'Phone number already registered',
    406: 'Recaptcha error',
  },
  [FORM_MODES.mobileLogin]: {
    404: 'Mobile number is not associated with any account',
    429: 'Request rate exceeded, please try after sometime',
  },
  [FORM_MODES.emailLogin]: {
    401: 'Email address or password is incorrect',
  },
  [FORM_MODES.loginOtp]: {
    404: 'Mobile number is not associated with any account',
    401: 'OTP you entered is incorrect',
  },
  [FORM_MODES.signupOtp]: {
    404: 'User Does not exist!',
    401: 'OTP you entered is incorrect',
  },
};
