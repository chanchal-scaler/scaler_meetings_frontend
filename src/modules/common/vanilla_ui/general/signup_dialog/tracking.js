class SignupDialogTracker {
  constructor(formId, clickSource, autoInitialize = true) {
    this._clickSource = clickSource;
    this._formId = formId;

    if (autoInitialize) this.initialize();
  }

  initialize() {
    this._initializeForm();

    if (!this._formEl) return;
    this._initializeInputActivity();
    // this._initializeBtnActivity();
  }

  formStatus(status, attributes) {
    window.GTMtracker?.pushEvent({
      event: 'gtm_custom_click',
      data: {
        ...attributes,
        form_status: status,
        click_source: this._formId,
      },
    });
  }

  _initializeForm() {
    this._formEl = document.getElementById(this._formId);
  }

  _trackingInputFilled(ele) {
    const fieldName = ele?.name;
    const fieldData = ele?.value;

    if (!fieldData) return;

    if (window.GTMtracker) {
      window.GTMtracker.pushEvent({
        event: 'gtm_custom_click',
        data: {
          click_type: 'form_input_filled',
          click_text: fieldName,
          click_source: this._formId,
          form_id: this._formId,
        },
      });
    }
  }

  _initializeInputActivity() {
    const formInputEls = this._formEl?.querySelectorAll('input.form-input');
    const selectInputEls = this._formEl?.querySelectorAll(
      'input.sr-select__value-input:not([name="country_code"])',
    );

    [...formInputEls].forEach((ele) => {
      ele.addEventListener('blur', () => {
        this._trackingInputFilled(ele);
      });
    });

    [...selectInputEls].forEach((ele) => {
      ele.addEventListener('input', () => {
        this._trackingInputFilled(ele);
      });
    });
  }
}

export default SignupDialogTracker;
