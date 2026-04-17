import Toastify from 'toastify-js';
import { Form } from '@common/vanilla_ui/general';
/* Number of seconds after which resend otp will be activated */
export const OTP_TIMEOUT = 60;
const OTP_EXPIRY = 600;
const activeClasses = ['primary', 'bold'];
class OtpForm extends Form {
  /* Public */
  constructor(
    element, options, showErrorToast = true, showSuccessToast = true,
  ) {
    super(element, options);
    this.timeLeft = OTP_TIMEOUT;
    this.otpExpiry = OTP_EXPIRY;
    this.otpExpiry -= 1;
    this.showErrorToast = showErrorToast;
    this.showSuccessToast = showSuccessToast;
  }

  initialize() {
    super.initialize();
    this._addEventListeners();
    this._initializeResendTriggers();
  }

  reset() {
    if (this._interval) {
      clearInterval(this._interval);
    }
    this._resendEl.classList.remove(...activeClasses);
    this.timeLeft = OTP_TIMEOUT;
    this.setDisabled(true);
    this._handleTick();
    this._interval = setInterval(this._handleTick, 1000);
    this._initializeVoiceTriggers();
  }

  /* Private */
  _addEventListeners() {
    super._addEventListeners();
    this.on('submitted', this._handleSubmit);
    this.on('error', this._handleError);
  }

  _handleError = () => {
    if (this.showErrorToast) {
      Toastify({
        text: 'Something went wrong! Reload the page and try again',
        className: 'toastify-danger',
      }).showToast();
    }
  }

  _handleSubmit = () => {
    if (this.showSuccessToast) {
      Toastify({
        text: 'You will receive OTP shortly',
        className: 'toastify-info',
      }).showToast();
    }
    this.reset();
  }

  _handleTick = () => {
    this.timeLeft -= 1;
    if (this.timeLeft === 0) {
      clearInterval(this._interval);
      this.setDisabled(false);
      if (this._resendElType === 'call') {
        this._resendEl.innerHTML = 'Resend Code via Voice';
      } else {
        this._resendEl.innerHTML = 'Resend Code via Text';
      }
      this._resendEl.classList.add(...activeClasses);
    } else {
      const timeLeft = String(this.timeLeft).padStart(2, '0');
      if (this._resendElType === 'call') {
        this._resendEl.innerHTML = '';
      } else {
        this._resendEl.innerHTML = `Resend Code in 00:${timeLeft}`;
      }
    }
  }

  _initializeResendTriggers() {
    this._resendEl = document.querySelector(
      `[data-action="otp"][data-form="${this.id}"]`,
    );
    /* [SMS, Call] */
    this._resendElType = this._resendEl.getAttribute('data-otp-via');
    this._resendEl.addEventListener('click', (event) => {
      event.preventDefault();
      this.submit();
    });
  }

  _initializeVoiceTriggers() {
    if (this._resendElType === 'call') {
      setTimeout(() => {
        this._resendEl.innerHTML = ``;
      }, this.otpExpiry * 1000);
    }
  }
}

export default OtpForm;
