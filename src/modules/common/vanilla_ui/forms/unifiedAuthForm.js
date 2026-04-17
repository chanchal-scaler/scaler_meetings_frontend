import Toastify from 'toastify-js';

import { apiRequest } from '@common/api/utils';
import { bookLiveClass } from '@common/vanilla_ui/forms/bookLiveClass';
import BookLiveClassSlot from '@common/vanilla_ui/forms/bookLiveClassSlot';
import {
  COUNTRY_CODE_SELECT_CONFIG,
  ORGNAME_SELECT_CONFIG,
} from '@event_landing/common/selectConfigs';
import { FlowTypes } from '@common/vanilla_ui/general/formFlow';
import {
  Form, FormFlow, Select, FocusOTPInput, // DigitOTPAutofill,
} from '@common/vanilla_ui/general';
import { isPresent } from '@common/utils/type';
import Validator from '@common/lib/validator';
import FormTracker from
  '@scaler_landing/pages/index_page/registerationForm/tracking';
import ValidateSelect from
  '@common/vanilla_ui/forms/validators/selectValidator';
import gtmTracking from '@common/vanilla_ui/tracking/gtm';

const formId = 'unified-auth-form';

const authFormHandlers = {
  'unified-auth-form-phone': '_landingAuthFormPhoneHandler',
  'unified-auth-form-login-otp':
    '_landingAuthFormLoginOtpHandler',
  'unified-auth-form-personal-details':
     '_landingAuthFormPersonalDetailsHandler',
  'unified-auth-form-personal-details-auth':
     '_landingAuthFormPersonalDetailsAuthHandler',
  'unified-auth-form-login-auth-otp':
    '_landingAuthFormLoginAuthOtpHandler',
  'unified-auth-form-success-state': '_landingAuthFormSuccessStateHandler',
  'unified-auth-form-booked-class': '_landingAuthFormBookedClassHandler',
  'unified-auth-form-book-class': '_landingAuthFormBookClassHandler',
};

const validatorSchema = {
  phone_number: 'mobile',
  full_name: {
    required: true,
    message: 'Please enter a valid name',
    isValid: (value) => /^[a-zA-Z\s]+$/.test(value),
  },
  email: 'email',
  other_position: 'required',
  graduation_year: {
    required: true,
    message: 'Add correct grad year',
    isValid: (value) => {
      const currentTime = new Date();
      const currentYear = currentTime.getFullYear();
      return value <= currentYear + 8 && value >= currentYear - 50;
    },
  },
  otp_verification: {
    required: true,
    message: 'Please fill all the digits',
    isValid: (value) => value.length === 6,
  },
};

const errorMessage = 'We are unable to process your request right now,'
  + ' please refresh and try again in sometime.';

const formFlowEl = document.querySelector('#unified-auth-form');
const formInputClass = 'form-input';
const formInputFilledClass = `${formInputClass}--filled`;
const formInputErrorClass = `${formInputClass}--error`;
const formFieldClass = 'form-field';
const fieldErrorClass = `${formFieldClass}__error`;
const fieldErrorHiddenClass = `${fieldErrorClass}--hidden`;
const inputBoxClass = `${formId}__input-box`;
const turnstileId = 'cf-turnstile-response';
const resendViaVoiceEl = document.getElementById(
  `${formId}-resend-via-voice`,
);
const progressBar = document.querySelector(
  `.${formId}__progress-bar`,
);

const leadIp = formFlowEl?.getAttribute('data-lead-ip');
const leadSource = formFlowEl?.getAttribute('data-lead-source');
const leadSection = formFlowEl?.getAttribute('data-lead-section');
const forceCPERedirection = window.__IS_CPE_REDIRECTION_ENABLED__ === 'true';
class LandingAuthFormV3 extends FormFlow {
  constructor(
    id, program, waitTime = 3000, mode = 'page', autoInitialise = true,
  ) {
    const formType = FlowTypes.page;
    super('unified-auth-form', id, formType, mode);

    this._waitTime = waitTime;
    this._program = program;
    this.userDetails = {};
    this.initializeOrgYearInputs();
    this.initializeGradYearInputs();
    this.initializeOrgnameHandler();
    this.initializeCompanynameHandler();
    this.initializeOrgpositionHandler();
    this.initializeCompanypositionHandler();
    this.validator = new Validator(validatorSchema);
    this._setFormHandlers();
    if (autoInitialise) this.landingAuthFormFlowInitialize();
  }

  landingAuthFormFlowInitialize() {
    this.initialize();
  }

  _setFormHandlers() {
    Object.keys(authFormHandlers).forEach(mode => {
      this.setFormHandler(mode, this[authFormHandlers[mode]]);
    });
  }

  _checkParams = (conditions = {}) => {
    const params = new URLSearchParams(window.location.search);
    return Object.entries(conditions).every((entry) => {
      const [key, value] = entry;
      return params.get(key) === value;
    });
  };

  _setToastifyClass = (toastType) => {
    let shiftToastifyClass = '';
    if (this._checkParams({ iframe: 'true' })) {
      shiftToastifyClass = 'scaler-event__toastify-shift';
    }

    return `toastify-${toastType} ${shiftToastifyClass}`;
  };

  _toggleErrorField = ({
    errorEle, error, inputEls, addInputClass, removeInputClass,
  }) => {
    const errorField = errorEle;
    const borderField = formFlowEl.querySelector('.phone-input');
    if (error) {
      errorField.classList.remove(fieldErrorHiddenClass);
      borderField.classList.add('field-border-error');
    } else {
      errorField.classList.add(fieldErrorHiddenClass);
      borderField.classList.remove('field-border-error');
    }
    inputEls.forEach(input => {
      input.classList.add(addInputClass);
      input.classList.remove(removeInputClass);
    });
  }

  _phoneHandlerCommon(
    {
      phoneFormId,
      normalizedPhoneInputId,
      phoneNumberInputId,
      countryCodeSelect,
      formEl,
      submitBtn,
      phoneElKey,
    },
  ) {
    const proceedBtn = submitBtn;
    const normalizedPhoneEl = document.getElementById(
      normalizedPhoneInputId,
    );
    this[phoneElKey] = document.getElementById(
      phoneNumberInputId,
    );
    const phoneContainer = formEl.querySelector(
      `.${phoneFormId}__primary-phone-number`,
    );
    const errorField = phoneContainer?.querySelector(
      `.${fieldErrorClass}`,
    );

    const handlePhoneFieldsChange = () => {
      this[phoneElKey].value = `${countryCodeSelect.selectedValue}-`
      + `${normalizedPhoneEl.value}`;
      const { phone_number: error } = this.validator.check({
        phone_number: this[phoneElKey].value,
      }) || {};
      if (isPresent(error)) {
        this._toggleErrorField(
          {
            errorEle: errorField,
            inputEls: [normalizedPhoneEl],
            error,
            addInputClass: formInputErrorClass,
            removeInputClass: formInputFilledClass,
          },
        );
        if (proceedBtn) proceedBtn.disabled = true;
      } else {
        this._toggleErrorField(
          {
            errorEle: errorField,
            inputEls: [normalizedPhoneEl],
            addInputClass: formInputFilledClass,
            removeInputClass: formInputErrorClass,
          },
        );
        if (proceedBtn) proceedBtn.disabled = false;
      }
    };
    if (countryCodeSelect && normalizedPhoneEl && this[phoneElKey]) {
      normalizedPhoneEl.addEventListener('input', handlePhoneFieldsChange);
      countryCodeSelect.on('change', handlePhoneFieldsChange);
    }
  }

  _prefillSelect = (element, value) => {
    if (!isPresent(value)) return;

    const selectOptionEl = () => {
      const optionSelector = '.sr-select__option';

      return element._dropdownEl.querySelector(
        `${optionSelector}[data-value="${value}"]`,
      );
    };

    const optionEl = selectOptionEl();
    if (!optionEl) {
      element._renderOptions([{
        value,
        label: value,
      }], true);
    }
    element._selectOption(
      selectOptionEl(element, value),
    );
  };

  initializePhoneHandler(formEl, submitBtn = null) {
    const phoneFormId = `${formId}`;
    const normalizedPhoneInputId = `${formId}__phone-number`;
    const phoneCountryCodeInputId = `${formId}__phone-code`;
    const phoneNumberInputId = `${formId}__phone`;
    const countryCodeSelect = new Select(
      phoneCountryCodeInputId,
      COUNTRY_CODE_SELECT_CONFIG,
    );
    this._phoneHandlerCommon({
      phoneFormId,
      countryCodeSelect,
      normalizedPhoneInputId,
      phoneNumberInputId,
      formEl,
      submitBtn,
      phoneElKey: 'phoneNumberEl',
    });
  }

  initializeAuthPhoneHandler(formEl, submitBtn = null) {
    const phoneFormId = `${formId}__auth`;
    const normalizedPhoneInputId = `${formId}__auth__phone-number`;
    const phoneCountryCodeInputId = `${formId}__auth__phone-code`;
    const phoneNumberInputId = `${formId}__auth__phone`;
    const countryCodeSelect = new Select(
      phoneCountryCodeInputId,
      COUNTRY_CODE_SELECT_CONFIG,
    );
    this._phoneHandlerCommon({
      phoneFormId,
      countryCodeSelect,
      normalizedPhoneInputId,
      phoneNumberInputId,
      formEl,
      submitBtn,
      phoneElKey: 'phoneNumberEl',
    });
  }

  _landingPhoneVerificationHandler = async (
    phoneNumber, email, registrationTracking, turnstileResponse,
  ) => {
    const payload = {
      [turnstileId]: turnstileResponse,
      resend: false,
      user: {
        phone_number: phoneNumber,
        email,
      },
    };
    try {
      await apiRequest(
        'POST',
        '/users/v2/account/phone-otp',
        payload,
      );
      this.switchMode(`${formId}-login-auth-otp`);
      registrationTracking.formStatusTracking(
        'unified-auth-form-personal-details-auth-success',
        { success_message: 'Successfully submitted phone number and sent OTP' },
      );

      const formIdentifier = '-login-auth-otp';
      const otpIdentifier = '__login_auth_otp';
      // Auto-Fill OTP Feature
      // Disabled for now
      // DigitOTPAutofill(otpIdentifier);
      // Focus OTP Field in m-web
      FocusOTPInput(`${formId}${formIdentifier}`, `otp_1${otpIdentifier}`);
    } catch (error) {
      let message = 'Something went wrong! Reload the page and try again';
      if (error.response && error.response.status === 409) {
        message = 'Phone number associated with another account';
      } else if (error.response && error.response.status === 403) {
        message = 'Your email is already registered,'
          + ' click here to login instead.';
      } else if (error.response && error.response.status === 422) {
        message = error?.responseJson?.message || 'Please fill all fields';
      } else if (error.response && error.response.status === 429) {
        message = `Cannot generate OTP due to too many attempts, 
        please try again later.`;
      } else if (error?.responseJson?.message) {
        message = error.responseJson.message;
      }
      Toastify({
        text: message,
        className: this._setToastifyClass('danger'),
      }).showToast();
      registrationTracking.formStatusTracking(
        'unified-auth-form-personal-details-auth-error',
        { error_message: message },
      );
    }
  }

  validateBoxInputs(inputs, validatorKey) {
    let combinedValue = '';
    inputs.forEach(input => {
      if (isPresent(input.value)) {
        combinedValue += input.value;
      }
    });
    const boxValidator = {};
    boxValidator[validatorKey] = combinedValue;
    const error = this.validator.check(boxValidator);

    return isPresent(error) ? error[validatorKey] : null;
  }

  commonOrgYearSelectInputHandler = (elementId, editBtnClass, selectEl) => {
    const selectElement = document.getElementById(elementId);
    const editElement = selectElement.querySelector('.sr-select__input');
    const arrowElement = selectElement.querySelector('.sr-select__arrow');
    const gradElement = selectElement.querySelector('.sr-select__value-input');
    const editBtn = document.querySelector(`.${editBtnClass}`);

    if (gradElement.value) {
      editElement.disabled = true;
      selectElement.classList.add(`${formId}__edit-disabled`);
      arrowElement.classList.add('hidden');
      if (editBtn) {
        editBtn.style.display = 'block';
        editBtn.addEventListener('click', () => {
          editElement.disabled = false;
          selectElement.classList.remove(`${formId}__edit-disabled`);
          editBtn.classList.add('hidden');
          arrowElement.classList.remove('hidden');
        });
      }
    }

    ValidateSelect.initialize({ element: selectEl, formId });
    this.on('prefill_values', (fieldValues) => {
      const { graduation_year: graduationYear } = fieldValues;
      this._prefillSelect(selectEl, graduationYear);
      if (graduationYear !== null) {
        editElement.disabled = true;
        selectElement.classList.add(`${formId}__edit-disabled`);
        arrowElement.classList.add('hidden');
        if (editBtn) {
          editBtn.style.display = 'block';
          editBtn.addEventListener('click', () => {
            editElement.disabled = false;
            selectElement.classList.remove(`${formId}__edit-disabled`);
            editBtn.classList.add('hidden');
            arrowElement.classList.remove('hidden');
          });
        }
      }
    });
  }

  initializeOrgYearInputs = () => {
    const orgyearInputId = `${formId}__orgyear`;
    const editBtnClass = 'edit-btn-orgyear';
    this.orgyearSelect = new Select(orgyearInputId, { searchable: true });
    const selectEl = this.orgyearSelect;
    this.commonOrgYearSelectInputHandler(
      orgyearInputId, editBtnClass, selectEl,
    );
  };

  initializeGradYearInputs = () => {
    const gradYearInputId = `${formId}__gradYear`;
    const editBtnClass = 'edit-btn-gradYear';
    this.gradYearSelect = new Select(gradYearInputId, { searchable: true });
    const selectEl = this.gradYearSelect;
    this.commonOrgYearSelectInputHandler(
      gradYearInputId, editBtnClass, selectEl,
    );
  }

  commonOrgnameSelectInputHandler(elementId, editBtnClass, selectEl) {
    const orgnameInputEl = document.getElementById(elementId);
    const editBtn = document.querySelector(editBtnClass);
    const editElement = orgnameInputEl.querySelector('.sr-select__input');
    const arrowElement = orgnameInputEl.querySelector('.sr-select__arrow');
    const compElement = orgnameInputEl.querySelector('.sr-select__value-input');

    if (compElement.value) {
      editElement.disabled = true;
      orgnameInputEl.classList.add(`${formId}__edit-disabled`);
      arrowElement.classList.add('hidden');
      if (editBtn) {
        editBtn.style.display = 'block';
        editBtn.addEventListener('click', () => {
          editElement.disabled = false;
          orgnameInputEl.classList.remove(`${formId}__edit-disabled`);
          editBtn.classList.add('hidden');
          arrowElement.classList.remove('hidden');
        });
      }
    }

    if (orgnameInputEl) {
      ValidateSelect.initialize({ element: selectEl, formId });
      this.on('prefill_values', (fieldValues) => {
        const { orgname } = fieldValues;
        this._prefillSelect(selectEl, orgname);
        if (orgname !== null) {
          editElement.disabled = true;
          orgnameInputEl.classList.add(`${formId}__edit-disabled`);
          arrowElement.classList.add('hidden');
          if (editBtn) {
            editBtn.style.display = 'block';
            editBtn.addEventListener('click', () => {
              editElement.disabled = false;
              orgnameInputEl.classList.remove(`${formId}__edit-disabled`);
              editBtn.classList.add('hidden');
              arrowElement.classList.remove('hidden');
            });
          }
        }
      });
    }
  }

  initializeOrgnameHandler() {
    const orgnameInputId = `${formId}-orgname`;
    const editBtnClass = '.edit-btn-orgname';
    this.orgnameSelect = new Select(orgnameInputId, ORGNAME_SELECT_CONFIG);
    const selectEl = this.orgnameSelect;
    this.commonOrgnameSelectInputHandler(
      orgnameInputId, editBtnClass, selectEl,
    );
  }

  initializeCompanynameHandler() {
    const orgnameInputId = `${formId}-company_name`;
    const editBtnClass = '.edit-btn-company_name';
    this.companyNameSelect = new Select(orgnameInputId, ORGNAME_SELECT_CONFIG);
    const selectEl = this.companyNameSelect;
    this.commonOrgnameSelectInputHandler(
      orgnameInputId, editBtnClass, selectEl,
    );
  }

  commonOrgpositionSelectInputHandler(
    elementId, otherPositionInputId, editBtnClass, selectEl,
  ) {
    const positionInputEl = document.getElementById(elementId);
    const otherPositionInputEl = document.getElementById(otherPositionInputId);
    const otherPositionFieldEl = otherPositionInputEl.parentElement;
    const editBtn = document.querySelector(editBtnClass);
    const editElement = positionInputEl.querySelector('.sr-select__input');
    const arrowElement = positionInputEl.querySelector('.sr-select__arrow');
    const jobElement = positionInputEl.querySelector('.sr-select__value-input');

    if (jobElement.value) {
      editElement.disabled = true;
      positionInputEl.classList.add(`${formId}__edit-disabled`);
      arrowElement.classList.add('hidden');
      if (editBtn) {
        editBtn.style.display = 'block';
        editBtn.addEventListener('click', () => {
          editElement.disabled = false;
          positionInputEl.classList.remove(`${formId}__edit-disabled`);
          editBtn.classList.add('hidden');
          arrowElement.classList.remove('hidden');
        });
      }
    }

    if (positionInputEl) {
      ValidateSelect.initialize({ element: selectEl, formId });
      selectEl.on('change', (value) => {
        if (value.toLowerCase() === 'other') {
          otherPositionFieldEl.classList.remove('hidden');
          otherPositionInputEl.required = true;
        } else {
          otherPositionFieldEl.classList.add('hidden');
          otherPositionInputEl.required = false;
        }
      });
      this.on('prefill_values', (fieldValues) => {
        const { job_title: jobTitle } = fieldValues;
        this._prefillSelect(selectEl, jobTitle);
        if (jobTitle !== null) {
          editElement.disabled = true;
          positionInputEl.classList.add(`${formId}__edit-disabled`);
          arrowElement.classList.add('hidden');
          if (editBtn) {
            editBtn.style.display = 'block';
            editBtn.addEventListener('click', () => {
              editElement.disabled = false;
              positionInputEl.classList.remove(`${formId}__edit-disabled`);
              editBtn.classList.add('hidden');
              arrowElement.classList.remove('hidden');
            });
          }
        }
      });
    }
  }

  initializeOrgpositionHandler = () => {
    const positionInputId = `${formId}-position`;
    const otherPositionInputId = `${formId}-other-position`;
    const editBtnClass = '.edit-btn-pos';
    this.positionSelect = new Select(positionInputId, { searchable: true });
    const selectEl = this.positionSelect;
    this.commonOrgpositionSelectInputHandler(
      positionInputId, otherPositionInputId, editBtnClass, selectEl,
    );
  };

  initializeCompanypositionHandler = () => {
    const positionInputId = `${formId}-company-position`;
    const otherPositionInputId = `${formId}-other-auth-position`;
    const editBtnClass = '.edit-btn-position';
    this.companyPositionSelect = new Select(
      positionInputId, { searchable: true },
    );
    const selectEl = this.companyPositionSelect;
    this.commonOrgpositionSelectInputHandler(
      positionInputId, otherPositionInputId, editBtnClass, selectEl,
    );
  };

  _resendVoiceOtp = (phoneNumber) => {
    if (resendViaVoiceEl) {
      resendViaVoiceEl.addEventListener('click', async () => {
        try {
          await apiRequest(
            'POST',
            `/api/v3/auth/retry`,
            {
              method: 'mobile',
              identifier: phoneNumber,
              otp_channel: 'voice',
            },
          );
          Toastify({
            text: 'You will receive OTP shortly!',
            className: this._setToastifyClass('success'),
          }).showToast();
          gtmTracking.sendFormSubmitStatus(formId, true);
        } catch (error) {
          Toastify({
            text: errorMessage,
            className: this._setToastifyClass('danger'),
          }).showToast();
          gtmTracking.sendFormSubmitStatus(formId, false, errorMessage);
        }
      });
    }
  }

  _editPhoneNumber = () => {
    const editBtn = formFlowEl.querySelector(`.${formId}__phone-otp-edit`);

    editBtn.addEventListener('click', () => {
      this.switchMode(`${formId}-phone`);
    });
  }

  _boxInputValue = (payload, startPattern) => {
    if (!isPresent(payload)) return '';

    const boxValues = Object.entries(payload)
      .sort((a, b) => {
        const [keya] = a;
        const [keyb] = b;

        return keya < keyb;
      })
      .reduce(
        (accumulator, currentValue) => {
          const [fieldName, value] = currentValue;
          if (fieldName.startsWith(startPattern)) {
            return accumulator + value;
          }

          return accumulator;
        },
        '',
      );
    return boxValues;
  }

  _handleBoxInputs(formEl, className, validatorKey) {
    const inputs = formEl.querySelectorAll(
      `.${className}`,
    );
    const boxContainer = formEl.querySelector(
      `.form-field[data-name='${validatorKey}']`,
    );
    const errorField = boxContainer?.querySelector(
      `.${fieldErrorClass}`,
    );
    const errorManipulation = () => {
      const error = this.validateBoxInputs(inputs, validatorKey);
      if (error) {
        this._toggleErrorField(
          {
            errorEle: errorField,
            inputEls: inputs,
            error,
            addInputClass: `${inputBoxClass}--error`,
            removeInputClass: `${inputBoxClass}--filled`,
          },
        );
      } else {
        this._toggleErrorField(
          {
            errorEle: errorField,
            inputEls: inputs,
            addInputClass: `${inputBoxClass}--filled`,
            removeInputClass: `${inputBoxClass}--error`,
          },
        );
      }
    };
    const totalOtpInputs = inputs.length;
    inputs.forEach((input, index) => {
      ['focus', 'blur'].forEach(listener => {
        input.addEventListener(listener, errorManipulation);
      });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace') {
          if (isPresent(inputs[index].value)) {
            inputs[index].value = '';
          } else if (index !== 0) {
            inputs[index - 1].focus();
          }
          errorManipulation();
        }
      });

      input.addEventListener('input', () => {
        inputs[index].value = inputs[index].value.replace(/[^0-9]/g, '');
        if (inputs[index].value !== '') {
          if (index !== totalOtpInputs - 1) inputs[index + 1].focus();
        }
        errorManipulation();
      });
    });
  }

  _increaseProgressBar = (value) => {
    if (progressBar) {
      progressBar.dataset.progress = value;
    }
  };

  _handleFlCForceRedirection = () => {
    window.location.replace(`/career-profile-tool/?from_page=${this._program}`);
  }

  _decideSuccessMode = () => {
    if (BookLiveClassSlot.checkEligibility(this._program)) {
      this.switchMode('unified-auth-form-book-class');
    } else {
      this.switchMode('unified-auth-form-success-state');
    }
  }

  _landingAuthFormDetailsHandler = async () => {
    const personalFormFields = ['full_name', 'email'];
    try {
      const otpRequest = await apiRequest(
        'GET',
        '/api/v3/profile',
      );

      const { data: { attributes } } = otpRequest;
      const {
        name, email, orgyear, orgname, job_title: jobTitle,
      } = attributes;

      const userData = {
        full_name: name,
        email,
        graduation_year: orgyear,
        orgname,
        job_title: jobTitle,
      };

      this.userDetails = {
        ...this.userDetails,
        ...userData,
      };

      const fields = [
        'full_name',
        'email',
        'graduation_year',
        'orgname',
        'job_title',
      ];

      const missingFields = fields.filter(field => !userData[field]);
      const isProfileCompleted = Object.values(userData).every(
        value => Boolean(value),
      );
      const isNewUser = !(
        userData.graduation_year
        && userData.orgname
        && userData.job_title
      );

      if (isNewUser) {
        this._increaseProgressBar('3');
        this.emit('prefill_values', userData);
        this.switchMode('unified-auth-form-personal-details');
      } else if (isProfileCompleted) {
        this._increaseProgressBar('success');
        this._decideSuccessMode();
        this.emit('registered_successfully');
      } else if (missingFields.some(
        item => personalFormFields.includes(item),
      )) {
        this._increaseProgressBar('3');
        this.emit('prefill_values', userData);
        this.switchMode('unified-auth-form-personal-details');
      } else {
        this._increaseProgressBar('success');
        this._decideSuccessMode();
        this.emit('registered_successfully');
      }
    } catch (error) {
      let message = 'Something went wrong! Reload the page and try again';
      if (error.response && error.response.status === 409) {
        message = 'Phone number associated with another account';
      } else if (error.response && error.response.status === 403) {
        message = 'Your email is already registered,'
          + ' click here to login instead.';
      } else if (error.response && error.response.status === 422) {
        message = error?.responseJson?.message || 'Please fill all fields';
      } else if (error.response && error.response.status === 429) {
        message = `Cannot generate OTP due to too many attempts, 
        please try again later.`;
      } else if (error?.responseJson?.message) {
        message = error.responseJson.message;
      }
      Toastify({
        text: message,
        className: this._setToastifyClass('danger'),
      }).showToast();
    }
  }

  _showInputField = (formEl, inputId) => {
    const inputEl = formEl.querySelector(`#${inputId}`);
    if (!inputEl) return;

    inputEl.required = true;
    inputEl.value = '';
    inputEl.dispatchEvent(new Event('input'));
    const parentElement = inputEl.parentNode;
    parentElement?.classList.remove('hidden');
  };

  /* Form handlers */
  _landingAuthFormPhoneHandler = (el) => {
    const whatsappConsentInputEl = el.querySelector(
      `#${formId}-whatsapp_consent`,
    );
    const registerBtn = el.querySelector(`#${formId}-phone-submit`);
    const registrationTracking = new FormTracker(
      el.id, { click_source: `${formId}-${this._program}` },
    );

    const form = new Form(el, {
      method: 'POST',
      endpoint: '/api/v3/auth/login-and-signup',
      createPayload: ({
        country_code: countryCode,
        user_number: userNumber,
        'cf-turnstile-response': turnstileResponse,
        whatsapp_consent: whatsappConsent,
      }) => ({
        method: 'mobile',
        identifier: `${countryCode}-${userNumber}`,
        'cf-turnstile-response': turnstileResponse,
        whatsapp_consent: whatsappConsent,
      }),
    });

    const whatsappConsentHandler = () => {
      if (whatsappConsentInputEl) {
        whatsappConsentInputEl.addEventListener('click', () => {
          if (whatsappConsentInputEl.value === 'whatsapp_consent_yes') {
            whatsappConsentInputEl.setAttribute('value', 'whatsapp_consent_no');
          } else {
            whatsappConsentInputEl.setAttribute(
              'value', 'whatsapp_consent_yes',
            );
          }
        });
      }
    };

    form.on('initialize', () => {
      registerBtn.disabled = true;
      registerBtn.addEventListener('click', () => {
        Toastify({
          text: 'Fetching your details...',
          className: this._setToastifyClass('info'),
        }).showToast();
      });
      whatsappConsentHandler();
      this.initializePhoneHandler(el, registerBtn);
      registrationTracking._initializeInputClickTracking();
    });

    form.on('submitted', () => {
      this.userDetails = {
        ...this.userDetails,
        whatsapp_consent: whatsappConsentInputEl?.value,
      };
      const countryCode = form.getFieldValue('country_code');
      const phoneNumber = form.getFieldValue('user_number');
      const loginOtpForm = document.querySelector(
        `.${formId}__phone-otp-input`,
      );
      loginOtpForm.value = `${countryCode}-${phoneNumber}`;
      this._resendVoiceOtp(`${countryCode}-${phoneNumber}`);
      this._increaseProgressBar('2');
      this.switchMode(`${formId}-login-otp`);

      const formIdentifier = '-login-otp';
      const otpIdentifier = '__login_otp';
      // Auto-Fill OTP Feature
      // Disabled for now
      // DigitOTPAutofill(otpIdentifier);
      // Focus OTP Field in m-web
      FocusOTPInput(`${formId}${formIdentifier}`, `otp_1${otpIdentifier}`);
      registrationTracking.formStatusTracking(
        `${el.id}-success`,
        { success_message: 'Successfully submitted phone number' },
      );
      gtmTracking.sendFormSubmitStatus(el.id, true);
      if (leadIp) {
        gtmTracking.sendCustomClick('lead_gen_request', {
          ip: leadIp,
          source: leadSource,
          section: leadSection,
        });
      }
    });

    form.on('error', (error) => {
      const message = error?.responseJson?.message || `Something went wrong! 
      Refresh the page and try again`;
      Toastify({
        text: message,
        className: this._setToastifyClass('danger'),
      }).showToast();
      registerBtn.disabled = false;
      registrationTracking.formStatusTracking(
        `${el.id}-error`,
        { error_message: message },
      );
      gtmTracking.sendFormSubmitStatus(el.id, false, message);
      if (leadIp) {
        gtmTracking.sendCustomClick('lead_gen_request_error', {
          ip: leadIp,
          source: leadSource,
          section: leadSection,
        });
      }
    });

    form.initialize();

    return form;
  }

  _landingAuthFormLoginOtpHandler = (el) => {
    const registrationTracking = new FormTracker(
      el.id,
      { click_source: `${formId}-${this._program}` },
    );

    const form = new Form(el, {
      method: 'POST',
      endpoint: '/api/v3/auth/verify-otp',
      createPayload: ({
        user_number: userNumber,
        ...payload
      }) => ({
        method: 'mobile',
        identifier: userNumber,
        code: this._boxInputValue(payload, 'otp_'),
      }),
    });

    const allFieldsValid = () => {
      let valid = true;
      const inputs = el.querySelectorAll(`.${formId}__otp-input`);
      valid &&= !isPresent(this.validateBoxInputs(inputs, 'otp_verification'));

      return valid;
    };

    form.on('initialize', () => {
      const registerBtn = el.querySelector(`.${formId}__proceed-otp-btn`);
      registerBtn.disabled = true;
      this._editPhoneNumber();
      this._handleBoxInputs(el, `${formId}__otp-input`, 'otp_verification');
      const boxInputs = el.querySelectorAll(`.${formId}__otp-input`);

      boxInputs.forEach((boxInput) => {
        boxInput.addEventListener('input', () => {
          if (isPresent(boxInput.value) && allFieldsValid()) {
            registerBtn.disabled = false;
            registerBtn.classList.remove(`${formId}__disabled`);
          } else {
            registerBtn.disabled = true;
          }
        });
        boxInput.addEventListener('keydown', (event) => {
          if (event.key === 'Backspace') {
            if (isPresent(boxInput.value) && allFieldsValid()) {
              registerBtn.disabled = false;
            } else {
              registerBtn.disabled = true;
            }
          }
        });
      });
      registrationTracking._initializeInputClickTracking();
    });

    form.on('submitted', (json) => {
      if (json.success) {
        const phoneNumber = form.getFieldValue('user_number');
        sessionStorage.setItem('user_registration', true);
        this._landingAuthFormDetailsHandler(phoneNumber);
        registrationTracking.formStatusTracking(
          `${el.id}-success`,
          { success_message: 'Successfully submitted OTP form' },
        );
        gtmTracking.sendFormSubmitStatus(el.id, true);
        if (leadIp) {
          gtmTracking.sendCustomClick('lead_gen', {
            ip: leadIp,
            source: leadSource,
            section: leadSection,
          });
        }
      } else {
        const { message } = json;
        form.setFieldError('otp_verification', message);
        const inputs = document.querySelectorAll(
          '.unified-auth-form__otp-input',
        );
        inputs.forEach(input => {
          input.classList.add('unified-auth-form__otp-input--error');
        });
        registrationTracking.formStatusTracking(
          `${el.id}-error`,
          { error_message: message },
        );
        gtmTracking.sendFormSubmitStatus(el.id, false, message);
        if (leadIp) {
          gtmTracking.sendCustomClick('lead_gen_error', {
            ip: leadIp,
            source: leadSource,
            section: leadSection,
          });
        }
      }
    });

    form.on('error', error => {
      let message = errorMessage;
      if (error && error.isFromServer) {
        if (error.responseJson?.signature && error.response?.status === 403) {
          message = 'Session Limit Exceeded!';
          window.location = `${window.location.origin}`
          + '/users/session-management/?signature='
          + `${error.responseJson?.signature}`
          + '&source_path='
          // eslint-disable-next-line camelcase
          + `${error.responseJson?.source_path}`;
        }
        form.setFieldError('otp_verification', message);
        const inputs = document.querySelectorAll(
          '.unified-auth-form__otp-input',
        );
        inputs.forEach(input => {
          input.classList.add('unified-auth-form__otp-input--error');
        });
      }
      registrationTracking.formStatusTracking(
        `${el.id}-error`,
        { error_message: message },
      );
      gtmTracking.sendFormSubmitStatus(el.id, false, message);
    });

    form.initialize();
    return form;
  }

  _landingAuthFormPersonalDetailsHandler = (el) => {
    const registrationTracking = new FormTracker(
      el.id,
      { click_source: `${formId}-${this._program}` },
    );
    const elementIdMapping = {
      full_name: `${formId}-name`,
      email: `${formId}-email`,
    };

    const selectEls = [
      this.orgyearSelect,
      this.orgnameSelect,
      this.positionSelect,
    ];

    const elementConfigMapping = {
      orgyear: {
        type: 'select',
        element: this.orgyearSelect,
        hidden: false,
        payload_keys: ['orgyear'],
      },
      orgname: {
        type: 'select',
        element: this.orgnameSelect,
        hidden: false,
        payload_keys: ['orgname'],
      },
      job_title: {
        type: 'select',
        element: this.positionSelect,
        hidden: false,
        payload_keys: ['position', 'other_position'],
      },
    };
    const otherPositionId = `${formId}-other-position`;
    const otherPositionEl = el.querySelector(`#${otherPositionId}`);

    const form = new Form(el, {
      method: 'PUT',
      endpoint: '/api/v3/profile',
      createPayload: ({
        full_name: fullName,
        user_email: userEmail,
        user__orgyear: userOrgyear,
        orgname,
        job_title: jobTitle,
        other_position: otherPosition,
      }) => ({
        name: fullName,
        email: userEmail,
        orgyear: userOrgyear,
        orgname,
        job_title: jobTitle,
        other_position: otherPosition,
      }),
    });

    const submitBtn = el.querySelector(`.${formId}__submit-btn`);

    const allFieldsValid = () => (
      Object.entries(elementIdMapping).every(([fieldName, elementId]) => {
        const element = el.querySelector(`#${elementId}`);
        const validatorJson = {};
        if (element) {
          validatorJson[fieldName] = element.value;
        }
        return isPresent(element.value);
      })
    );

    const allSelectFieldsValid = () => {
      let valid = true;
      Object.entries(elementConfigMapping).forEach(mapping => {
        const [fieldName, fieldConfig] = mapping;

        const {
          type, element, wrapperClass, hidden,
        } = fieldConfig;
        if (!hidden) {
          if (type === 'select') {
            valid &&= isPresent(element.selectedValue);
          } else if (type === 'box_input') {
            const wrapperEle = el.querySelector(`.${wrapperClass}`);
            const inputs = wrapperEle.querySelectorAll(
              `.${formId}__input-box`,
            );
            valid &&= !isPresent(
              this.validateBoxInputs(inputs, fieldName),
            );
          }
        }
      });
      if (otherPositionEl) {
        valid &&= (
          !otherPositionEl.required || isPresent(otherPositionEl.value)
        );
      }
      return valid;
    };

    form.on('initialize', () => {
      registrationTracking._initializeInputClickTracking();
      submitBtn.disabled = true;
      Object.entries(elementIdMapping).forEach(mapping => {
        const [fieldName, elementId] = mapping;
        const element = el.querySelector(`#${elementId}`);
        const { parentNode } = element;
        const editBtn = parentNode.querySelector('.edit-btn');
        if (element) {
          element.addEventListener('input', () => {
            const errorEle = parentNode.querySelector(`.${fieldErrorClass}`);
            const validatorJson = {};
            validatorJson[fieldName] = element.value;
            const error = this.validator.check(validatorJson);

            if (allFieldsValid() && allSelectFieldsValid()) {
              submitBtn.disabled = false;
            } else {
              submitBtn.disabled = true;
            }

            if (isPresent(error)) {
              this._toggleErrorField(
                {
                  errorEle,
                  error: error[fieldName],
                  inputEls: [element],
                  addInputClass: formInputErrorClass,
                  removeInputClass: formInputFilledClass,
                },
              );
            } else {
              this._toggleErrorField(
                {
                  errorEle,
                  inputEls: [element],
                  addInputClass: formInputFilledClass,
                  removeInputClass: formInputErrorClass,
                },
              );
            }
          });
          this.on('prefill_values', (fieldValues) => {
            const value = fieldValues[fieldName];

            if ((fieldName === 'email' && (
              value?.includes('tmp.com') || value === ''))
            || (fieldName === 'full_name' && (
              value === null || value === ''))) {
              element.disabled = false;
              if (editBtn) {
                editBtn.style.display = 'none';
              }
            } else {
              element.disabled = true;
            }
            if (value) {
              element.value = value;
              element.dispatchEvent(new Event('input'));
            }
          });
        }
        if (element.disabled) {
          if (editBtn) {
            editBtn.style.display = 'block';
            editBtn.addEventListener('click', () => {
              element.disabled = false;
              editBtn.style.display = 'none';
            });
          }
        }
      });
      selectEls.forEach(selectEl => {
        selectEl.addEventListener('change', () => {
          if (isPresent(selectEl.selectedValue) && allSelectFieldsValid()) {
            submitBtn.disabled = false;
          } else {
            submitBtn.disabled = true;
          }
        });
      });
      if (otherPositionEl) {
        otherPositionEl.addEventListener('input', () => {
          const { parentNode } = otherPositionEl;
          const errorEle = parentNode.querySelector(`.${fieldErrorClass}`);
          const validatorJson = {
            other_position: otherPositionEl.value,
          };
          const error = this.validator.check(validatorJson);
          if (isPresent(error)) {
            this._toggleErrorField(
              {
                errorEle,
                error: error.other_position,
                inputEls: [otherPositionEl],
                addInputClass: formInputErrorClass,
                removeInputClass: formInputFilledClass,
              },
            );
            submitBtn.disabled = true;
          } else {
            this._toggleErrorField(
              {
                errorEle,
                inputEls: [otherPositionEl],
                addInputClass: formInputFilledClass,
                removeInputClass: formInputErrorClass,
              },
            );
            if (allFieldsValid() && allSelectFieldsValid()) {
              submitBtn.disabled = false;
            }
          }
        });
      }

      if (allFieldsValid() && allSelectFieldsValid()) {
        submitBtn.disabled = false;
      }
    });

    form.on('submitted', (json) => {
      if (json.success) {
        this._increaseProgressBar('success');
        this._decideSuccessMode();
        this.emit('registered_successfully');
        registrationTracking.formStatusTracking(
          `${el.id}-success`,
          // eslint-disable-next-line max-len
          { success_message: 'Successfully submitted personal details form and redirect to free-product' },
        );
        gtmTracking.sendFormSubmitStatus(el.id, true);
        if (leadIp) {
          gtmTracking.sendCustomClick('lead_gen_personal_details', {
            ip: leadIp,
            source: leadSource,
            section: leadSection,
          });
        }
      } else {
        Toastify({
          text: errorMessage,
          className: this._setToastifyClass('danger'),
        }).showToast();
        registrationTracking.formStatusTracking(
          `${el.id}-error`,
          { error_message: errorMessage },
        );
        gtmTracking.sendFormSubmitStatus(formId, false, errorMessage);
        if (leadIp) {
          gtmTracking.sendCustomClick('lead_gen_personal_details_error', {
            ip: leadIp,
            source: leadSource,
            section: leadSection,
          });
        }
      }
    });

    form.on('error', error => {
      const message = error?.responseJson?.message || `Something went wrong! 
      Refresh the page and try again`;
      Toastify({
        text: message,
        className: this._setToastifyClass('danger'),
      }).showToast();
      registrationTracking.formStatusTracking(
        `${el.id}-error`,
        { error_message: message },
      );
      gtmTracking.sendFormSubmitStatus(formId, false, message);
      if (leadIp) {
        gtmTracking.sendCustomClick('lead_gen_personal_details_error', {
          ip: leadIp,
          source: leadSource,
          section: leadSection,
        });
      }
    });

    form.initialize();
    return form;
  }

  _landingAuthFormPersonalDetailsAuthHandler = (el) => {
    const registrationTracking = new FormTracker(
      el.id,
      { click_source: `${formId}-${this._program}` },
    );
    let turnstileResponse = '';
    const elementIdMapping = {
      full_name: `${formId}-name`,
      email: `${formId}-email`,
    };

    const selectEls = [
      this.gradYearSelect,
      this.companyNameSelect,
      this.companyPositionSelect,
    ];

    const elementConfigMapping = {
      orgyear: {
        type: 'select',
        element: this.gradYearSelect,
        hidden: false,
        payload_keys: ['orgyear'],
      },
      orgname: {
        type: 'select',
        element: this.companyNameSelect,
        hidden: false,
        payload_keys: ['orgname'],
      },
      job_title: {
        type: 'select',
        element: this.companyPositionSelect,
        hidden: false,
        payload_keys: ['position', 'other_position'],
      },
    };
    const otherPositionId = `${formId}-other-position`;
    const otherPositionEl = el.querySelector(`#${otherPositionId}`);

    const form = new Form(el, {
      method: 'PUT',
      endpoint: '/api/v3/profile',
      createPayload: ({
        full_name: fullName,
        user_email: userEmail,
        user__orgyear: userOrgyear,
        orgname,
        job_title: jobTitle,
        other_position: otherPosition,
      }) => ({
        name: fullName,
        email: userEmail,
        orgyear: userOrgyear,
        orgname,
        job_title: jobTitle,
        other_position: otherPosition,
      }),
    });

    const submitBtn = el.querySelector(`.${formId}__submit-btn`);

    const allFieldsValid = () => (
      Object.entries(elementIdMapping).every(([fieldName, elementId]) => {
        const element = el.querySelector(`#${elementId}`);
        const validatorJson = {};
        if (element) {
          validatorJson[fieldName] = element.value;
        }
        return isPresent(element.value);
      })
    );

    const phoneFieldsValid = () => {
      const phoneNumber = form.getFieldValue('user_number');
      const { phone_number: phoneError } = this.validator.check({
        phone_number: phoneNumber,
      }) || {};
      return !isPresent(phoneError);
    };

    const allSelectFieldsValid = () => {
      let valid = true;
      Object.entries(elementConfigMapping).forEach(mapping => {
        const [fieldName, fieldConfig] = mapping;

        const {
          type, element, wrapperClass, hidden,
        } = fieldConfig;
        if (!hidden) {
          if (type === 'select') {
            valid &&= isPresent(element.selectedValue);
          } else if (type === 'box_input') {
            const wrapperEle = el.querySelector(`.${wrapperClass}`);
            const inputs = wrapperEle.querySelectorAll(
              `.${formId}__input-box`,
            );
            valid &&= !isPresent(
              this.validateBoxInputs(inputs, fieldName),
            );
          }
        }
      });
      if (otherPositionEl) {
        valid &&= (
          !otherPositionEl.required || isPresent(otherPositionEl.value)
        );
      }
      return valid;
    };

    form.on('initialize', () => {
      registrationTracking._initializeInputClickTracking();
      submitBtn.disabled = true;
      Object.entries(elementIdMapping).forEach(mapping => {
        const [fieldName, elementId] = mapping;
        const element = el.querySelector(`#${elementId}`);
        const { parentNode } = element;
        const editBtn = parentNode.querySelector('.edit-btn');
        if (element) {
          element.addEventListener('input', () => {
            const errorEle = parentNode.querySelector(`.${fieldErrorClass}`);
            const validatorJson = {};
            validatorJson[fieldName] = element.value;
            const error = this.validator.check(validatorJson);

            if (allFieldsValid()) {
              submitBtn.disabled = false;
            } else {
              submitBtn.disabled = true;
            }

            if (isPresent(error)) {
              this._toggleErrorField(
                {
                  errorEle,
                  error: error[fieldName],
                  inputEls: [element],
                  addInputClass: formInputErrorClass,
                  removeInputClass: formInputFilledClass,
                },
              );
            } else {
              this._toggleErrorField(
                {
                  errorEle,
                  inputEls: [element],
                  addInputClass: formInputFilledClass,
                  removeInputClass: formInputErrorClass,
                },
              );
            }
          });
          this.on('prefill_values', (fieldValues) => {
            const value = fieldValues[fieldName];

            if ((fieldName === 'email' && (
              value?.includes('tmp.com') || value === ''))
            || (fieldName === 'full_name' && (
              value === null || value === ''))) {
              element.disabled = false;
              if (editBtn) {
                editBtn.style.display = 'none';
              }
            } else {
              element.disabled = true;
            }
            if (value) {
              element.value = value;
              element.dispatchEvent(new Event('input'));
            }
          });
        }
        if (element.disabled) {
          if (editBtn) {
            editBtn.style.display = 'block';
            editBtn.addEventListener('click', () => {
              element.disabled = false;
              editBtn.style.display = 'none';
            });
          }
        }
      });
      selectEls.forEach(selectEl => {
        selectEl.addEventListener('change', () => {
          if (isPresent(selectEl.selectedValue) && allSelectFieldsValid()) {
            submitBtn.disabled = false;
          } else {
            submitBtn.disabled = true;
          }
        });
      });
      if (otherPositionEl) {
        otherPositionEl.addEventListener('input', () => {
          const { parentNode } = otherPositionEl;
          const errorEle = parentNode.querySelector(`.${fieldErrorClass}`);
          const validatorJson = {
            other_position: otherPositionEl.value,
          };
          const error = this.validator.check(validatorJson);
          if (isPresent(error)) {
            this._toggleErrorField(
              {
                errorEle,
                error: error.other_position,
                inputEls: [otherPositionEl],
                addInputClass: formInputErrorClass,
                removeInputClass: formInputFilledClass,
              },
            );
            submitBtn.disabled = true;
          } else {
            this._toggleErrorField(
              {
                errorEle,
                inputEls: [otherPositionEl],
                addInputClass: formInputFilledClass,
                removeInputClass: formInputErrorClass,
              },
            );
            if (allFieldsValid()) {
              submitBtn.disabled = false;
            }
          }
        });
      }
      if (phoneFieldsValid) {
        submitBtn.disabled = false;
      }
      this.initializeAuthPhoneHandler(el, submitBtn);
      window.loadTurnstile(
        `${el.id}-cf-turnstile`,
        {
          callbackFn: (token) => {
            turnstileResponse = token;
          },
        },
      );
    });

    form.on('submitted', (json) => {
      if (json.success) {
        const countryCode = form.getFieldValue('country_code');
        const phoneNumber = form.getFieldValue('user_number');
        const emailValue = form.getFieldValue('user_email');
        const loginOtpForm = document.querySelector(
          `.${formId}__phone-otp-auth-input`,
        );
        loginOtpForm.value = `${countryCode}-${phoneNumber}`;
        this._landingPhoneVerificationHandler(
          `${countryCode}-${phoneNumber}`,
          emailValue,
          registrationTracking,
          turnstileResponse,
        );
        registrationTracking.formStatusTracking(
          `${el.id}-success`,
          {
            success_message: 'Successfully submitted details and phone number',
          },
        );
        gtmTracking.sendFormSubmitStatus(el.id, true);
      } else {
        Toastify({
          text: json.message,
          className: this._setToastifyClass('danger'),
        }).showToast();
        registrationTracking.formStatusTracking(
          `${el.id}-error`,
          { error_message: json.message },
        );
        gtmTracking.sendFormSubmitStatus(el.id, false, json.message);
      }
    });

    form.on('error', error => {
      const message = error?.responseJson?.message || `Something went wrong! 
      Refresh the page and try again`;
      Toastify({
        text: message,
        className: this._setToastifyClass('danger'),
      }).showToast();
      registrationTracking.formStatusTracking(
        `${el.id}-error`,
        { error_message: message },
      );
      gtmTracking.sendFormSubmitStatus(el.id, false, message);
    });

    form.initialize();
    return form;
  }

  _landingAuthFormLoginAuthOtpHandler = (el) => {
    const registrationTracking = new FormTracker(
      el.id,
      { click_source: `${formId}-${this._program}` },
    );

    const form = new Form(el, {
      method: 'POST',
      endpoint: '/users/v2/account/verify',
      createPayload: ({
        user_number: userNumber,
        ...payload
      }) => ({
        user: {
          phone_number: userNumber,
          otp: this._boxInputValue(payload, 'otp_'),
        },
      }),
    });

    const allFieldsValid = () => {
      let valid = true;
      const inputs = el.querySelectorAll(`.${formId}__otp-input`);
      valid &&= !isPresent(this.validateBoxInputs(inputs, 'otp_verification'));

      return valid;
    };

    form.on('initialize', () => {
      const registerBtn = el.querySelector(`.${formId}__proceed-otp-btn`);
      registerBtn.disabled = true;
      // this._editPhoneNumber();
      this._handleBoxInputs(el, `${formId}__otp-input`, 'otp_verification');
      const boxInputs = el.querySelectorAll(`.${formId}__otp-input`);

      boxInputs.forEach((boxInput) => {
        boxInput.addEventListener('input', () => {
          if (isPresent(boxInput.value) && allFieldsValid()) {
            registerBtn.disabled = false;
            registerBtn.classList.remove(`${formId}__disabled`);
          } else {
            registerBtn.disabled = true;
          }
        });
        boxInput.addEventListener('keydown', (event) => {
          if (event.key === 'Backspace') {
            if (isPresent(boxInput.value) && allFieldsValid()) {
              registerBtn.disabled = false;
            } else {
              registerBtn.disabled = true;
            }
          }
        });
      });
      registrationTracking._initializeInputClickTracking();
    });

    form.on('submitted', () => {
      this._decideSuccessMode();
      this.emit('registered_successfully');
      registrationTracking.formStatusTracking(
        `${el.id}-success`,
        // eslint-disable-next-line max-len
        { success_message: 'Successfully verified phone number and redirect to Free Product' },
      );
      gtmTracking.sendFormSubmitStatus(el.id, true);
    });

    form.on('error', error => {
      let message = errorMessage;
      if (error && error.isFromServer) {
        switch (error.response.status) {
          case 403:
            message = 'OTP you entered is incorrect';
            break;
          default:
          // Do nothing
        }
      }
      form.setFieldError('otp_verification', message);
      const inputs = el.querySelectorAll(
        '.unified-auth-form__otp-input',
      );
      inputs.forEach(input => {
        input.classList.add('unified-auth-form__otp-input--error');
      });
      registrationTracking.formStatusTracking(
        `${el.id}-error`,
        { error_message: message },
      );
      gtmTracking.sendFormSubmitStatus(el.id, false, message);
    });

    form.initialize();
    return form;
  }

  _landingAuthFormSuccessStateHandler = (el) => {
    const countDown = () => {
      if (BookLiveClassSlot.checkEligibility(this._program)) return;

      const countdownTimerEl = el.querySelector(
        `#${formId}-reg-success-countdown`,
      );

      let timerValue = 4;
      const countdownInterval = setInterval(() => {
        if (timerValue === 1) {
          clearInterval(countdownInterval);
          if (forceCPERedirection) {
            bookLiveClass(
              this._program,
              undefined,
              undefined,
              this._handleFlCForceRedirection,
            );
          } else {
            bookLiveClass(this._program);
          }
        } else {
          timerValue -= 1;
          countdownTimerEl.textContent = timerValue;
        }
      }, 1000);
    };

    this.on('registered_successfully', () => {
      countDown();
    });
  }

  _landingAuthFormBookClassHandler = () => {
    this.on('registered_successfully', () => {
      BookLiveClassSlot.initializeBookLiveClassWidget(
        this._program,
        this,
        'unified-auth-form-booked-class',
      );
    });
  }

  _landingAuthFormBookedClassHandler = () => {
    BookLiveClassSlot.initializeBookedLiveClassWidget(
      this._program,
      this,
      undefined,
      forceCPERedirection ? this._handleFlCForceRedirection : null,
    );
  }
}

export default LandingAuthFormV3;
