import forOwn from 'lodash/forOwn';

import { apiRequest } from '@common/api/utils';
import { isFunction, isNullOrUndefined } from '@common/utils/type';
import { warn } from '@common/utils/debug';
import EventEmitter from '@common/lib/eventEmitter';
import Validator from '@common/lib/validator';

const actionDisabledClass = 'form__action--disabled';
const actionSubmittingClass = 'form__action--submitting';
const errorHiddenClass = 'form-error--hidden';
const fieldErrorHiddenClass = 'form-field__error--hidden';

/**
 * Options format
 */
const defaultOptions = {
  method: 'POST',
  endpoint: '/',
  // A function which will be passed with all input values
  createPayload: null,
  validations: {},
};

class Form extends EventEmitter {
  constructor(el, options) {
    super();
    this._element = el;
    this._options = { ...defaultOptions, ...options };
    // Name vs input el map
    this._inputEls = {};
    this._validator = new Validator(this.validations);
    this._fieldErrors = {};
  }

  /* Public */

  areFieldsValid(name = '') {
    const values = name ? this.getValueByName(name) : this.values;
    const errors = this._validator.check(values);

    if (errors) {
      this.setFieldErrors(errors);
      this.emit('invalidfields', errors);
      return false;
    } else {
      return true;
    }
  }

  initialize() {
    this._getReferences();
    this._addEventListeners();

    this.emit('initialize');
  }

  resetErrors() {
    this.setError(null);

    const errors = {};
    forOwn(this._fieldErrorEls, (_, k) => {
      errors[k] = null;
    });
    this.setFieldErrors(errors);
  }

  setDisabled(isDisabled) {
    this.isDisabled = isDisabled;
    if (isDisabled) {
      this._submitEl.classList.add(actionDisabledClass);
    } else {
      this._submitEl.classList.remove(actionDisabledClass);
    }
  }

  setError(message) {
    if (isNullOrUndefined(this._errorEl)) {
      if (message) {
        warn('Tried to set error for a form which does not have error p tag');
      }

      return;
    }

    if (isNullOrUndefined(message)) {
      this._errorEl.innerHTML = '';
      this._errorEl.classList.add(errorHiddenClass);
    } else {
      this._errorEl.innerHTML = message;
      this._errorEl.classList.remove(errorHiddenClass);
    }
  }

  setFieldErrors(fieldErrors = {}) {
    forOwn(fieldErrors, (value, key) => {
      this.setFieldError(key, value);
    });
  }

  setFieldError(fieldName, message) {
    const errorEl = this._fieldErrorEls[fieldName];
    if (isNullOrUndefined(errorEl)) {
      if (message) {
        warn('Tried to set error for a field which does not have error div');
      }

      return;
    }

    if (isNullOrUndefined(message)) {
      errorEl.innerHTML = '';
      errorEl.classList.add(fieldErrorHiddenClass);
    } else {
      errorEl.innerHTML = message;
      errorEl.classList.remove(fieldErrorHiddenClass);
    }
  }

  setSubmitting(isSubmitting) {
    this.isSubmitting = isSubmitting;
    if (isSubmitting) {
      this._submitEl.classList.add(actionSubmittingClass);
    } else {
      this._submitEl.classList.remove(actionSubmittingClass);
    }
  }

  async submit() {
    if (this.isDisabled || this.isSubmitting) {
      return;
    }

    this.resetErrors();

    if (!this.areFieldsValid()) {
      return;
    }

    this.emit('submit');

    let payload = this.values;
    if (isFunction(this.options.createPayload)) {
      payload = this.options.createPayload(payload);
    }
    this.setSubmitting(true);
    try {
      const json = await apiRequest(
        this.options.method,
        this.options.endpoint,
        payload,
      );
      this.emit('submitted', json);
    } catch (error) {
      this.emit('error', error);
    } finally {
      this._resetTurnstile();
    }

    this.setSubmitting(false);
  }

  getFieldValue(name) {
    if (this._inputEls[name].length > 1) {
      return this._inputEls[name].find(el => el.checked)?.value;
    }

    return this._inputEls[name][0]?.value;
  }

  updateField(name, value) {
    if (this._inputEls[name].length > 1) {
      const ele = this._inputEls[name].find(el => (el.value === `${value}`));

      if (ele) {
        ele.checked = true;
      }
    } else {
      this._inputEls[name][0].value = value;
    }
  }

  updateOptions(newOptions) {
    this._options = { ...this.options, ...newOptions };
  }

  get element() {
    return this._element;
  }

  get id() {
    return this.element.getAttribute('id');
  }

  get options() {
    return this._options;
  }

  get validations() {
    return this.options.validations || {};
  }

  get values() {
    const values = {};
    forOwn(this._inputEls, (_, name) => {
      values[name] = this.getFieldValue(name);
    });
    return values;
  }

  getValueByName(name) {
    const values = {};
    if (name) {
      values[name] = this.getFieldValue(name);
    }

    return values;
  }

  /* Private */

  _addEventListeners() {
    forOwn(this._inputEls, (els) => {
      els.forEach(el => {
        const eventName = el.dataset?.event || 'input';

        el.addEventListener(eventName, (event) => {
          const { name, value } = event.target;
          // Reset any error present when user starts changing values in form
          this.setError(null);
          this.setFieldError(name, null);

          this.emit('change', { name, value });
        });

        el.addEventListener('change', (event) => {
          const { name } = event.target;

          if (name === 'phone') {
            this.areFieldsValid('phone_number');
          } else {
            this.areFieldsValid(name);
          }
        });
      });
    });

    this.element.addEventListener('submit', async (event) => {
      event.preventDefault();
      this.submit();
    });

    document.addEventListener('recaptcha-loaded', () => {
      // _getReferences called here to get the lazy recaptch value
      this._getReferences();
    });

    document.addEventListener('recaptcha-reset', () => {
      // _getReferences called here to get the lazy recaptch value
      this._getReferences();
    });
  }

  _resetTurnstile() {
    const widgetId = `${this.id}-cf-turnstile`;
    const event = new CustomEvent(
      'reset-turnstile',
      {
        detail: {
          id: widgetId,
          trackTurnstileResponse: true,
        },
      },
    );

    document.dispatchEvent(event);
  }

  _getErrorElements() {
    // Form level error
    this._errorEl = this.element.querySelector('.form-error');

    // Field level errors
    const fieldErrorEls = this.element.querySelectorAll(
      '.form-field[data-name]',
    );
    this._fieldErrorEls = {};
    fieldErrorEls.forEach(el => {
      const name = el.getAttribute('data-name');
      const errorEl = el.querySelector('.form-field__error');
      if (name && errorEl) {
        this._fieldErrorEls[name] = errorEl;
      }
    });
  }

  _getFormElements() {
    const formElems = this._getFormNameSelectors();

    Object.keys(formElems).forEach(name => {
      this._inputEls[name] = Array.prototype.slice.call(
        this.element.querySelectorAll(formElems[name]),
      );
    });

    [this._submitEl] = this.element.querySelectorAll('[type="submit"]');
  }

  _getReferences() {
    this._getFormElements();
    this._getErrorElements();
  }

  _getFormNameSelectors() {
    const elems = this.element.elements;
    const obj = {};

    Array.prototype.slice.call(elems).forEach(elem => {
      if (elem.type === 'submit') {
        return;
      }

      obj[elem.name] = `[name="${elem.name}"]`;
    });

    return obj;
  }
}

export default Form;
