import { Select } from '@common/vanilla_ui/general';

export const otpFormId = `otp_form`;
export const phoneNumberLength = 10;
export const signupFormId = `signup_form`;
export const serverErrorMessage = `Something went wrong! Please try again`;
export const toastifyDanger = `toastify-danger`;
export const toastifySuccess = `toastify-success`;

// export const experienceMonthsInputId = 'experience_months';
// export const experienceYearsInputId = 'experience_years';
export const normalizedPhoneInputId = `${signupFormId}-normalized-phone`;
export const orgyearInputId = `${signupFormId}-orgyear`;
export const phoneCountryCodeInputId = `${signupFormId}-phone-country-code`;
export const phoneNumberInputId = `${signupFormId}-phone-number`;
export const whatsappConsentInputId = `${signupFormId}-whatsapp-consent`;
export const universityInputId = `${signupFormId}-university`;
export const orgnameInputId = `${signupFormId}-orgname`;
export const positionInputId = `${signupFormId}-position`;
export const otherPositionInputId = `${signupFormId}-other-position`;
export const otherPositionFieldSelector = "[data-name='other-position']";

// export const experienceYearsInputEl = document
//   .getElementById(experienceYearsInputId);
// export const experienceMonthsInputEl = document
//   .getElementById(experienceMonthsInputId);
export const orgyearInputEl = document.getElementById(orgyearInputId);
export const universityInputEl = document.getElementById(universityInputId);
export const orgnameInputEl = document.getElementById(orgnameInputId);
export const positionInputEl = document.getElementById(positionInputId);
export const otherPositionInputEl = document
  .getElementById(otherPositionInputId);
export const otherPositionFieldEl = document
  .querySelector(otherPositionFieldSelector);

export const otpFormEl = document.getElementById(otpFormId);
export const signupFormEl = document.getElementById(signupFormId);
export const whatsappConsentInputEl = document
  .getElementById(whatsappConsentInputId);

export const countryCodeSelect = new Select(
  phoneCountryCodeInputId,
  { searchable: true },
);

export const normalizedPhoneEl = document
  .getElementById(normalizedPhoneInputId);
export const phoneNumberEl = document.getElementById(phoneNumberInputId);

export const buttonNameList = ['register', 'verify', 'back', 'resend-via-msg',
  'resend-via-voice', 'submit-details'];

export const detailFields = ['email', 'experience_months',
  'experience_years', 'name', 'orgyear', 'whatsapp_consent'];

export const registerFields = [
  'name', 'email', 'orgyear', 'orgname', 'whatsapp_consent',
  'university', 'position', 'other_position',
];

export const otpResponseMap = {
  401: 'Incorrect OTP',
  403: 'Incorrect OTP',
  409: 'OTP Expired',
  404: 'Please check your details again!',
};

export const resendOtpResponseMap = {
  404: 'Please check your details again!',
  409: 'Phone number associated with another account',
  422: 'Please check your details again!',
  429: 'You have made a lot of requests. Please wait and try again!',
};

export const userCreationResponseMap = {
  403: 'Email associated with another account',
  409: 'Phone number associated with another account',
};
