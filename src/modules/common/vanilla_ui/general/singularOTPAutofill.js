import {
  OTP_FILLED_CLICK_TYPE,
  OTP_FILLED_WEBOTP,
} from '@common/vanilla_ui/data/otpFillActionData';

function singularOTPAutofill(otpInputId) {
  if ('OTPCredential' in window) {
    const input = document.querySelector(
      `input[autocomplete="one-time-code"][id=${otpInputId}]`,
    );
    if (!input) return;
    // Cancel the WebOTP API if the form is submitted manually.
    const controller = new AbortController();
    const otpAutoForm = input.closest('form');
    if (otpAutoForm) {
      otpAutoForm.addEventListener('submit', () => {
        // Cancel the WebOTP API.
        controller.abort();
      });
    }
    // Invoke the WebOTP API
    navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: controller.signal,
    }).then(otp => {
      input.value = otp.code;

      const event = new Event('singular-otp-autofilled');
      otpAutoForm?.dispatchEvent(event);

      // track otp fill action
      window?.GTMtracker?.pushEvent({
        event: 'gtm_custom_click',
        data: {
          click_type: OTP_FILLED_CLICK_TYPE,
          click_text: OTP_FILLED_WEBOTP,
        },
      });
    }).catch();
  }
}

export default singularOTPAutofill;
