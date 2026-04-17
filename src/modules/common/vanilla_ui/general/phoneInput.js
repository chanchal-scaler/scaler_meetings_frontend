import Select from './select';
import { apiRequest } from '@common/api/utils';
import { log } from '@common/utils/debug';

const defaultSelectConfig = {
  searchable: true,
  isAsync: true,
  hideHint: true,
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
      log(e);
      return [];
    }
  },
};

class PhoneInput {
  constructor(id) {
    this._id = id;

    this._getReferences();
    this._initialize();
  }

  get countryCodeId() {
    return `${this.id}-code`;
  }

  get element() {
    return this._element;
  }

  get id() {
    return this._id;
  }

  get phoneId() {
    return `${this.id}-number`;
  }

  /* Private */

  _getReferences() {
    this._element = document.getElementById(this.id);
    this._countryCodeEl = document.getElementById(this.countryCodeId);
    this._phoneEl = document.getElementById(this.phoneId);
  }

  _initialize() {
    this._countryCodeSelect = new Select(
      this.countryCodeId,
      defaultSelectConfig,
    );

    this._phoneEl.addEventListener('input', this._updatePhoneNumber);
    this._countryCodeSelect.on('change', this._updatePhoneNumber);

    this._updatePhoneNumber();
  }

  _updatePhoneNumber = () => {
    const countryCode = this._countryCodeSelect.selectedValue;
    const phone = this._phoneEl.value;
    const phoneRequired = this._phoneEl.hasAttribute('required');
    let phoneNumber = `${countryCode}-${phone}`;
    if (!phoneRequired && phone === '') {
      phoneNumber = '';
    }
    this.element.value = phoneNumber;
    this.element.dispatchEvent(new Event('input', {
      bubbles: true,
      cancelable: true,
    }));
  }
}

export default PhoneInput;
