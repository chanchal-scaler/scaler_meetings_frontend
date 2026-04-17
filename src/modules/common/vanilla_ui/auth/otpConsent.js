function otpConsent(authIds) {
  authIds.forEach((authId) => {
    const otpPermission = document.getElementById(`${authId}-permission`);
    const otpNotice = document.getElementById(`${authId}-notice`);
    const authBtn = document.querySelector(
      `[data-otp-permission-id="${authId}-submit"]`,
    );
    otpNotice?.classList.add('hidden');
    otpPermission?.addEventListener('click', () => {
        authBtn?.classList.toggle('is-disabled');
        otpNotice?.classList.toggle('hidden');
    });
  });
}

export default {
  initialize: otpConsent,
};
