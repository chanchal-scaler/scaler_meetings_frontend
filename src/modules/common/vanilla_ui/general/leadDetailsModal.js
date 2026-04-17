import Toastify from 'toastify-js';
import qs from 'query-string';

import { apiRequest } from '@common/api/utils';
import { urlJoinWithQueryParams } from '@common/utils/url';
import Modal from './modal';
import Select from './select';

const formId = 'lead-details-form';
const phoneNumberInputId = `${formId}-number`;
const phoneCountryCodeInputId = `${formId}-code`;
const emailInputId = `${formId}__email`;

const countryCodeSelectConfig = {
  searchable: true,
  isAsync: true,
  hideHint: false,
  hideHintOnInit: true,
  showOnlyInputOnFocus: true,
  optionMarkup: `
    <div class="sr-select__option" role="option" data-value="{{value}}">
      <div class="phone-input__option">
        <div class="phone-input__flag">
          <span class="iti__flag iti__{{label}}"> </span>
        </div>
        <div class="phone-input__option-code">
          {{value}}
        </div>
      </div>
    </div>
  `,
  loadOptions: async keyword => {
    try {
      const json = await apiRequest(
        'GET',
        '/country-codes',
        null,
        // Expect a '+' in the input
        { params: { q: encodeURIComponent(keyword) } },
      );
      return json.data.map(
        ({ flag, dial_code: dialCode }) => (
          { label: flag, value: dialCode }
        ),
      );
    } catch (e) {
      return [];
    }
  },
};

function initialize() {
  // Initialize Form Elements
  const formEl = document.getElementById(formId);
  const emailEl = document.getElementById(emailInputId);
  const phoneEl = document.getElementById(phoneNumberInputId);
  const countryCodeSelect = new Select(
    phoneCountryCodeInputId,
    countryCodeSelectConfig,
  );

  // Initialize components
  Modal.initialize();

  // Handling methods
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const phoneNumber = `${countryCodeSelect.selectedValue}-${phoneEl.value}`;
    const queryParams = {
      email: emailEl.value,
      phone_number: phoneNumber,
      country_code: countryCodeSelect.selectedValue,
    };
    try {
      const result = await apiRequest(
        'GET',
        `/api/v3/lead-owners/?${qs.stringify(queryParams)}`,
      );
      if (result.success) {
        let calendarUrl = result.meta.default_calendar_url;
        if (result.data.length === 1 && result.data[0].calendar_url) {
          calendarUrl = result.data[0].calendar_url;
        }
        window.Calendly.initPopupWidget({
          url: urlJoinWithQueryParams([calendarUrl], {
            email: emailEl.value, a1: phoneNumber,
          }),
        });
        Toastify({
          text: 'Select your slot',
          className: 'toastify-success',
        }).showToast();
      }
    } catch (error) {
      const errorMessage = error.responseJson.data
      || 'Something went wrong. Please try again!';
      Toastify({
        text: errorMessage,
        className: 'toastify-danger',
      }).showToast();
    }
  };

  // Event listeners
  formEl.addEventListener('submit', handleSubmitForm);
}

export default {
  initialize,
};
