import Modal, { modalEvents } from '@common/vanilla_ui/general/modal';
import { isMobile } from '@common/utils/responsive';

const MODAL_ID = 'resend-otp-exit-intent';
const RESEND_OTP_ELEMENT_CLASS = 'resend-otp-exit-intent__resend-otp-channel';
let CAPTCHA_TRIGGER_CLASS;
let OTP_INPUT_ID;
const modalElement = document.getElementById(MODAL_ID);

function otpInputPresent() {
  const otpInputEle = document.getElementById(OTP_INPUT_ID);
  return otpInputEle && otpInputEle.value;
}

// Should Trigger the exit intent modal
function shouldTriggerModal(event) {
  if (otpInputPresent()) return false;
  if (isMobile()) return true;
  return !event.toElement && !event.relatedTarget && event.clientY < 10;
}

function handleResendOtpEls() {
  const resendOtpEls = document.querySelectorAll(
    `.${RESEND_OTP_ELEMENT_CLASS}`,
  );

  resendOtpEls?.forEach(ele => {
    ele.addEventListener('click', () => {
      const recaptchaTriggerEle = document.querySelector(
        `.trigger-recaptcha${CAPTCHA_TRIGGER_CLASS}`,
      );
      recaptchaTriggerEle?.setAttribute(
        'data-otp-channel',
        ele.getAttribute('data-otp-channel'),
      );
      recaptchaTriggerEle?.click();
    });
  });
}

function focusOutHandler(event) {
  if (shouldTriggerModal(event)) {
    document.removeEventListener('mouseout', focusOutHandler);
    Modal.open(MODAL_ID, true);
  }
}

// Trigger the modal on mobile devices after a delay of 30 seconds.
function triggerMobileModalAfterDelay() {
  setTimeout(() => {
    if (shouldTriggerModal()) {
      Modal.open(MODAL_ID, true);
    }
  }, 30000); // 30 seconds
}

function handleModalOpen(id) {
  if (id === MODAL_ID) {
    window.GTMtracker?.pushEvent({
      event: 'gtm_custom_click',
      data: {
        click_text: 'Resend OTP exit intent open',
        click_type: 'resend-otp-exit-intent-open',
      },
    });
    handleResendOtpEls();
  }
}

function initListeners(captchaTriggerClass, otpInputID) {
  Modal.close(MODAL_ID);
  CAPTCHA_TRIGGER_CLASS = captchaTriggerClass;
  OTP_INPUT_ID = otpInputID;

  if (isMobile()) {
    triggerMobileModalAfterDelay();
  } else {
    document.addEventListener('mouseout', focusOutHandler);
  }
}

// Track Modal events
function setupModalEvents() {
  modalEvents.on('open', handleModalOpen);
}

function ExitIntentInit(captchaTriggerClass, otpInputID) {
  if (modalElement) {
    initListeners(captchaTriggerClass, otpInputID);
    setupModalEvents();
  }
}

export default { initialize: ExitIntentInit };
