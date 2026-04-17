import Toastify from 'toastify-js';


const SPECIAL_CHARACTER_REGEX = /[~`!#$%^&*+=\-[\]\\';,/{}|\\":<>?]/g;
const ALPHABET_REGEX = /[A-Za-z]/g;

const formFieldSelector = 'form-field';
const srFieldSelector = '.sr-select';
const errorFieldHidden = `${formFieldSelector}__error--hidden`;
const srFieldInvalid = 'sr-select--invalid';
const fieldValidatorClass = `${formFieldSelector}__validate-tick`;

const validateCreate = (value) => {
  if (value.match(SPECIAL_CHARACTER_REGEX)
    && value.match(SPECIAL_CHARACTER_REGEX).length > 2) {
    return false;
  } else if (!value.match(ALPHABET_REGEX)
    || value.match(ALPHABET_REGEX).length < 2) {
    return false;
  }
  return true;
};

const onError = (error, errorEl, srField) => {
  errorEl.classList.remove(errorFieldHidden);
  // eslint-disable-next-line no-param-reassign
  errorEl.innerHTML = error;
  srField.classList.add(srFieldInvalid);
};

const onValid = (errorEl, srField) => {
  errorEl.classList.add(errorFieldHidden);
  srField.classList.remove(srFieldInvalid);
};

const onCreate = (element, value) => {
  if (!validateCreate(value)) {
    element.clearSelection();
    Toastify({
      text: 'The name provided is not valid',
      className: 'toastify-danger',
    }).showToast();
  }
};

const addListener = (element, el, srField, onValidCb) => {
  const errorEl = el.querySelector(`.${formFieldSelector}__error`);
  const validateEle = el.querySelector(`.${fieldValidatorClass}`);

  element.addEventListener('empty', (error) => {
    if (element.selectedValue.length > 0) {
      return;
    }
    onError(error, errorEl, srField);
  });
  element.addEventListener('change', () => {
    onValid(errorEl, srField);
    onValidCb?.(validateEle, el);
  });
  element.addEventListener('create', (value) => {
    onCreate(element, value);
  });
};

const mapErrorFieldToId = (formEl, element, onValidCb) => {
  const formFieldEls = formEl.getElementsByClassName(formFieldSelector);
  Array.from(formFieldEls).forEach((el) => {
    const srFieldEl = el.querySelector(srFieldSelector);
    if (srFieldEl && srFieldEl.getAttribute('id') === element.id) {
      addListener(element, el, srFieldEl, onValidCb);
    }
  });
};

const commonSelectEventMapper = (formEl, element, callback) => {
  const formFieldEls = formEl.getElementsByClassName(formFieldSelector);
  Array.from(formFieldEls).forEach((el) => {
    const srFieldEl = el.querySelector(srFieldSelector);
    if (srFieldEl && srFieldEl.getAttribute('id') === element.id) {
      callback({ element, el, srFieldEl });
    }
  });
};

const validAndCompleteCallback = ({ element }) => {
  element.addEventListener('change', window.handleFormValidAndComplete);
};

const addFormValidAndCompleteListener = (formEl, element) => {
  if (window.showDisabledRegisterCta && window.handleFormValidAndComplete) {
    commonSelectEventMapper(formEl, element, validAndCompleteCallback);
  }
};

const initialize = ({ element, formId, onValidCb }) => {
  const formEl = document.getElementById(formId);
  mapErrorFieldToId(formEl, element, onValidCb);
  addFormValidAndCompleteListener(formEl, element);
};

export default { initialize };
