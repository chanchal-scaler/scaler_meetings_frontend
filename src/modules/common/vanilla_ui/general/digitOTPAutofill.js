function digitOTPAutofill(otpInputId) {
  if ('OTPCredential' in window) {
    const inputs = Array.from(
      { length: 6 },
      (_, i) => document.querySelector(`#otp_${i + 1}${otpInputId}`),
    );
    if (inputs.some(input => input === null)) return;
    // Cancel the WebOTP API if the form is submitted manually.
    const controller = new AbortController();
    const inputForm = inputs[0].closest('form');
    if (inputForm) {
      inputForm.addEventListener('submit', () => {
        // Cancel the WebOTP API.
        controller.abort();
      });
    }
    // Invoke the WebOTP API
    navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: controller.signal,
    }).then(otp => {
      const otpArray = otp.code.split('');
      if (otpArray.length === 6) {
        inputs.forEach((inputElement, index) => {
          const input = inputElement;
          input.value = otpArray[index];
        });
      }
    }).catch();
  }
}

export default digitOTPAutofill;
