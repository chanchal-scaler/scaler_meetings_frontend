import Validator from '@common/lib/validator';


const formFieldId = 'form-field';
const fieldInputId = 'form-input';
const fieldErrorClass = `${formFieldId}__error`;
const fieldValidatorClass = `${formFieldId}__validate-tick`;

const nameToValidation = {
  email: 'email',
  name: 'required',
  phone: 'mobile',
  normalized_phone: 'mobile',
  orgyear: {
    required: true,
    message: 'Add correct grad year',
    isValid: (value) => {
      const currentTime = new Date();
      const currentYear = currentTime.getFullYear();
      return value <= currentYear + 8 && value >= currentYear - 50;
    },
  },
};

const createKeyValuePair = (formEl, name, value) => {
  const keyValue = {};
  if (name && name === 'normalized_phone') {
    const countryCode = formEl.phone_country_code.value;
    // eslint-disable-next-line max-len
    keyValue[name] = value.trim().length === 0 ? null : `${countryCode}-${value}`;
  } else {
    keyValue[name] = value.trim().length === 0 ? null : value.trim();
  }
  return keyValue;
};

const showError = (errorEl, formInputEl, validatorEle) => {
  errorEl.classList.remove(`${fieldErrorClass}--hidden`);
  formInputEl.classList.add(`${fieldInputId}--invalid`);
  validatorEle?.classList.add('hidden');
};

const hideError = (errorEl, formInputEl, validatorEle) => {
  formInputEl.classList.remove(`${fieldInputId}--invalid`);
  errorEl.classList.add(`${fieldErrorClass}--hidden`);
  validatorEle?.classList.remove('hidden');
};


const initialize = (form) => {
  const formEl = document.getElementById(form.id);
  const formFieldEls = formEl.getElementsByClassName(formFieldId);
  const validator = new Validator(nameToValidation);

  Array.from(formFieldEls).forEach((element) => {
    const formInputEl = element.querySelector(`.${fieldInputId}`);
    const errorEl = element.querySelector(`.${fieldErrorClass}`);
    const validatorEle = element.querySelector(`.${fieldValidatorClass}`);
    if (formInputEl) {
      formInputEl.addEventListener('input', (event) => {
        const { name, value } = event.target;
        const keyValueMap = createKeyValuePair(formEl, name, value);
        const errors = validator.check(keyValueMap);
        if (errors && errors[name]) {
          showError(errorEl, formInputEl, validatorEle);
          errorEl.innerHTML = errors[name];
        } else {
          hideError(errorEl, formInputEl, validatorEle);
        }
        if (window.showDisabledRegisterCta
          && window.handleFormValidAndComplete) {
          window.handleFormValidAndComplete();
        }
      });
    }
  });
};

export default { initialize };
