function focusOTPInput(formId, otpInputId) {
  const otpFormField = document.getElementById(formId);
  function focusOTP() {
    const otpInputField = document.getElementById(otpInputId);
    if (!otpInputField) return;
    otpInputField.focus();
  }

  if (otpFormField
    && window.getComputedStyle(otpFormField).display !== 'none') {
    focusOTP();
  }
}

export default focusOTPInput;
