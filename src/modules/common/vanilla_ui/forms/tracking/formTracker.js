import { isPresent } from '@common/utils/type';

class FormTracker {
  constructor(formId, data = {}) {
    this.formEl = document.getElementById(formId);
    this.attributes = data;
  }

  _findElementItem = () => {
    let updatedFields = 0;
    let totalFields = 0;

    const formFields = this.formEl.querySelectorAll('.form-field:not(.hidden)');

    if (formFields) {
      [...formFields].forEach((formField) => {
        const selectFieldEl = formField.querySelector(
          '.sr-select__value-input',
        );
        const inputEl = formField.querySelector('.form-input');
        const inputEls = formField.querySelectorAll('input.box-input');
        const radioEls = formField.querySelectorAll('.radio-input');

        totalFields += 1;

        if (inputEl?.value || selectFieldEl?.value) {
          updatedFields += 1;
        } else if (inputEls.length > 0) {
          const allInputFilled = Array.from(inputEls).every(
            el => isPresent(el.value),
          );
          if (allInputFilled) updatedFields += 1;
        } else if (radioEls.length > 0) {
          const radioInputFilled = Array.from(radioEls).some(
            radioField => radioField.checked,
          );
          if (radioInputFilled) updatedFields += 1;
        }
      });
    }

    return `${updatedFields}/${totalFields}`;
  }

  _handleInputTracking = (el, e, index) => {
    const elementItem = this._findElementItem();

    const recaptchaEl = this.formEl.querySelector(
      '.g-recaptcha-custom:not(.hide)',
    );
    let reCaptchaVersion = '';

    if (recaptchaEl) {
      [...recaptchaEl.classList].forEach((elClass) => {
        if (elClass === 'lazy-recaptcha-v3') {
          reCaptchaVersion = 'recaptcha-v3';
        } else if (elClass === 'lazy-recaptcha-v2') {
          reCaptchaVersion = 'recaptcha-v2';
        }
      });
    }

    const selectFieldEl = el.querySelector('.sr-select__value-input');
    const inputEl = el.querySelector('.form-input');
    const checkEl = el.querySelector('.whatsapp-consent__checkmark');

    const elementName = e.target?.name || inputEl?.name || selectFieldEl?.name;
    const elementValue = e.target?.value
      || inputEl?.value
      || selectFieldEl?.value
      || checkEl?.checked;

    if (elementName) {
      window.GTMtracker?.pushEvent({
        event: 'gtm_custom_click',
        data: {
          click_text: elementName,
          click_type: 'form-fields',
          click_value: elementValue,
          click_position: index,
          click_item: elementItem,
          recaptcha_version: reCaptchaVersion,
          ...this.attributes,
        },
      });
    }
  }

  _initializeInputClickTracking = () => {
    const inputEls = this.formEl.querySelectorAll('.form-field:not(.hidden)');

    if (inputEls) {
      [...inputEls].forEach((inputEl, index) => {
        inputEl.addEventListener('click',
          (event) => this._handleInputTracking(inputEl, event, index));
      });
    }
  }

  formStatusTracking = (status, attributes) => {
    window.GTMtracker?.pushEvent({
      event: 'gtm_custom_click',
      data: {
        ...attributes,
        form_status: status,
      },
    });
  };
}

export default FormTracker;
