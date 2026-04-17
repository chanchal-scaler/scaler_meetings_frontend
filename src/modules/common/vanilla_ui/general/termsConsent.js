function initializeTermsConsent(formId = 'register') {
  const termsConsentId = `${formId}-terms-consent`;
  const termsConsentEl = document.getElementById(termsConsentId);
  if (termsConsentEl) {
    termsConsentEl.addEventListener('change', (e) => {
      if (e.target.checked) {
        e.target.value = 'true';
      } else {
        e.target.value = '';
      }
    });
  }
}

export default {
  initialize: initializeTermsConsent,
};
