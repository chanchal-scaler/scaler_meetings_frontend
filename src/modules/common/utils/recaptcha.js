export function retryWithRecaptchaV2Params(formId) {
  if (window.TrackingHelper?.getContext('recaptcha-v2-forms')[formId]) {
    return { retry: true };
  }

  return {};
}
