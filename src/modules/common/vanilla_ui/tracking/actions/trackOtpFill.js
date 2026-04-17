import {
  OTP_FILLED_CLICK_TYPE,
  OTP_FILLED_MANUALLY,
  OTP_FILLED_AUTOMATICALLY,
} from '@common/vanilla_ui/data/otpFillActionData';

export default function trackOtpFill({ otpInputId }) {
  const otpInput = document.getElementById(otpInputId);

  if (otpInput !== null) {
    otpInput.addEventListener('input', (event) => {
      let clickText;
      // Future proofing for both OTP Formats
      if (String(event.target.value).length === 6
      || String(event.target.value).length === 4) {
        clickText = OTP_FILLED_AUTOMATICALLY;
      } else {
        clickText = OTP_FILLED_MANUALLY;
      }

      window?.GTMtracker?.pushEvent({
        event: 'gtm_custom_click',
        data: {
          click_type: OTP_FILLED_CLICK_TYPE,
          click_text: clickText,
        },
      });
    }, { once: true });
  }
}
