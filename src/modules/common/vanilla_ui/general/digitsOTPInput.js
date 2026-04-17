/* eslint-disable no-param-reassign */
import gtmTracking from '@common/vanilla_ui/tracking/gtm';

const otpContainerSelector = '.otp-input-container';
const otpHiddenInputSelector = '.otp-hidden-input';
const otpDigitSelector = '.otp-digit-input';

function registerOTPInput(container) {
  const hiddenInput = container.querySelector(otpHiddenInputSelector);
  if (!hiddenInput) return;

  const digitBoxes = container.querySelectorAll(otpDigitSelector);
  if (!digitBoxes.length) return;

  const maxLength = parseInt(
    container.dataset.otpLength, 10,
  ) || digitBoxes.length;

  const gtmTrackingFormId = container.dataset.gtmTracking || '';
  let previousLength = hiddenInput.value.length;

  let otpAutoInput = false;

  function updateBox(box, index, value, cursorPosition) {
    const digit = value[index] ?? '';
    const isFilled = Boolean(digit);
    const isActive = index === Math.min(cursorPosition, maxLength - 1);
    const currentBox = box;

    currentBox.textContent = digit;
    currentBox.dataset.filled = isFilled;
    currentBox.dataset.active = isActive;
  }

  function render() {
    const { value } = hiddenInput;
    const activeIndex = Math.min(value.length, maxLength - 1);
    digitBoxes.forEach((box, i) => updateBox(box, i, value, activeIndex));
  }

  function sanitize(value) {
    return value.replace(/\D/g, '').slice(0, maxLength);
  }

  function setInputValue(newValue) {
    hiddenInput.value = sanitize(newValue);
    render();
  }

  function setFocusState(isFocused) {
    container.dataset.focused = isFocused;
  }

  hiddenInput.addEventListener('input', (e) => {
    if (otpAutoInput) return;

    setInputValue(e.target.value);
    const currentLength = hiddenInput.value.length;

    if (gtmTracking && window.GTMtracker) {
      const actionType = currentLength > previousLength
        ? 'digit_added' : 'digit_removed';

      gtmTracking.sendCustomClick('otp_input_filled', {
        form_id: gtmTrackingFormId,
        action_type: actionType,
        digits_count: currentLength,
      });
    }
    previousLength = currentLength;
  });

  hiddenInput.addEventListener('paste', (e) => {
    e.preventDefault();

    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    const pasted = clipboardData.getData('text');
    if (!pasted) return;

    otpAutoInput = true;
    setInputValue(pasted);
    hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
    otpAutoInput = false;

    if (gtmTracking && window.GTMtracker) {
      gtmTracking.sendCustomClick('otp_input_filled', {
        form_id: gtmTrackingFormId,
        action_type: 'otp_auto_input',
        digits_count: hiddenInput.value.length,
      });
    }
  });

  const form = hiddenInput.closest('form');
  form?.addEventListener('singular-otp-autofilled', () => {
    otpAutoInput = true;
    render();
    previousLength = hiddenInput.value.length;
    setTimeout(() => { otpAutoInput = false; }, 0);
  });

  hiddenInput.addEventListener('focus', () => {
    setFocusState(true);
    render();

    setTimeout(() => {
      container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  });

  hiddenInput.addEventListener('blur', () => {
    setFocusState(false);
    digitBoxes.forEach((box) => { box.dataset.active = false; });
  });

  hiddenInput.addEventListener('keyup', render);
  hiddenInput.addEventListener('click', render);

  render();
}

function initializeOTPInputs() {
  const containers = document.querySelectorAll(
    `${otpContainerSelector}[data-behaviour='otp-input']`,
  );

  containers.forEach(registerOTPInput);
}

export default {
  initialize: initializeOTPInputs,
  registerOTPInput,
};
