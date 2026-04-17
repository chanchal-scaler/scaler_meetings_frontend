/**
 * Utility function to check if short OTP (4 digits) should be used
 * Reads from window.__SHORT_OTP__ which can be set as boolean or string
 * @returns {boolean} true if short OTP should be used, false otherwise
 */
export function shouldUseShortOtp() {
  const value = window.__SHORT_OTP__;
  return value === true || value === 'true';
}
