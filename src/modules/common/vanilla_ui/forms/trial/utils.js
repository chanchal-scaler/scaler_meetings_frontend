import { Select } from '@common/vanilla_ui/general';
import Toastify from 'toastify-js';
import Validator from '@common/lib/validator';
import {
  buttonNameList,
  countryCodeSelect,
  normalizedPhoneEl,
  phoneNumberEl,
} from './constants';

function createSimpleSelect(el, id, isSearchable) {
  if (el) {
    return new Select(id, { searchable: isSearchable });
  }
  return null;
}

function createGeneralSelect(el, id, options) {
  if (el) {
    return new Select(id, options);
  }
  return null;
}

function getValueofField(fieldName) {
  if (document.querySelector(`input[name="${fieldName}"]`)) {
    return document.querySelector(`input[name="${fieldName}"]`).value;
  } else {
    return null;
  }
}

function getFormattedPhoneNumber() {
  phoneNumberEl.value = `${countryCodeSelect.selectedValue}-`
    + `${normalizedPhoneEl.value}`;
  return phoneNumberEl.value;
}

function unHideFromField(formId, names) {
  names.forEach(name => {
    if (document.getElementById(`${formId}-${name}-div`)) {
      document
        .getElementById(`${formId}-${name}-div`).classList.remove('hidden');
    }
  });
}

function showHiddenFormDiv(formId, names, hasCheck = false, check = null) {
  if (hasCheck) {
    if (check) {
      unHideFromField(formId, names);
    }
  } else {
    unHideFromField(formId, names);
  }
}

function toggleButtonAbility(disable) {
  buttonNameList.forEach(el => {
    let button = `button[name=${el}]`;
    if (document.querySelector(button)) {
      if (disable) {
        document.querySelector(button).classList.add('is-disabled');
      } else {
        document.querySelector(button).classList.remove('is-disabled');
      }
    }
    button = `div[name=${el}]`;
    if (document.querySelector(button)) {
      if (disable) {
        document.querySelector(button).classList.add('is-disabled');
      } else {
        document.querySelector(button).classList.remove('is-disabled');
      }
    }
  });
}

function screenToggler(elementIds) {
  elementIds.forEach(elId => {
    if (document.getElementById(elId)) {
      document.getElementById(elId).classList.toggle('hidden');
    }
  });
}

function showToastifyAndEnableButton(toastifyMessage, toastifyClass) {
  Toastify({
    text: toastifyMessage,
    className: toastifyClass,
  }).showToast();
  toggleButtonAbility(false);
}

function showToastify(toastifyMessage, toastifyClass) {
  Toastify({
    text: toastifyMessage,
    className: toastifyClass,
  }).showToast();
}

function areValidFields(validations, event) {
  const validator = new Validator(validations);

  const values = {};
  Object.keys(validations).forEach((field) => {
    values[field] = event.target.elements[field].value;
  });

  const errors = validator.check(values);

  if (errors) {
    const errorMessage = errors[Object.keys(errors)[0]];
    showToastify(errorMessage, 'toastify-danger');

    return false;
  }

  return true;
}


export default {
  createSelect: createSimpleSelect,
  getFieldValue: getValueofField,
  phoneNumberValue: getFormattedPhoneNumber,
  showHiddenField: showHiddenFormDiv,
  toastifyAndButtonEnable: showToastifyAndEnableButton,
  toastify: showToastify,
  toggleButtons: toggleButtonAbility,
  toggleScreens: screenToggler,
  createGeneralSelect,
  areValidFields,
};
