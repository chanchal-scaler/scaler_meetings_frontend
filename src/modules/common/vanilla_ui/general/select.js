import debounce from 'lodash/debounce';

import { bindContextToMethods } from '@common/utils/object';
import { fromTemplate } from '@common/utils/string';
import { getNextSibling, getPreviousSibling } from '@common/utils/dom';
import { isNullOrUndefined } from '@common/utils/type';
import EventEmitter from '@common/lib/eventEmitter';

const hiddenInputSelector = '.sr-select__value-input';
const noOptionsSelector = '.sr-select__no-options';
const optionSelector = '.sr-select__option';
const optionsSelector = '.sr-select__options';
const placeholderSelector = '.sr-select__placeholder';
const valueSelector = '.sr-select__value';
const visibleInputSelector = '.sr-select__input';
const dropdownSelector = '.sr-select__dropdown';
const loaderSelector = '.sr-select__loader';
const hintSelector = '.sr-select__hint';
const createOptionSelector = '.sr-select__create-option';

const focusedClass = 'sr-select--focused';
const optionFocusedClass = 'sr-select__option--focused';
const optionSelectedClass = 'sr-select__option--selected';

const keyCodes = {
  arrowDown: 40,
  arrowUp: 38,
  enter: 13,
  tab: 9,
};

const defaultConfig = {
  // When options that are created dynamically i.e, may be from a result
  // of ajax call etc.
  optionMarkup: `
  <div
    class="sr-select__option"
    role="option"
    data-permanant="false"
    data-value="{{value}}"
    id="{{id}}-select-option"
  >
    {{label}}
  </div>
  `,
  searchable: false,
  isAsync: false,
  isCreatable: false,
  hideHint: true,
  hideHintOnInit: false,
  showOnlyInputOnFocus: false,
  retainPlaceholderOnClear: false,
  // Async function to load options which will be used when `isAsync` is true
  // eslint-disable-next-line
  loadOptions: (keyword) => { },
  // A funtion to call everytime an option is selected
  onOptionSelect: () => { },
};

class Select extends EventEmitter {
  constructor(id, config = {}) {
    super();
    this._id = id;
    this._finalConfig = { ...defaultConfig, ...config };

    const methodsToBind = [
      'attachListenersToOptions', '_handleOptionClick', '_handleOutsideClick',
      '_hideDropdown', '_selectOption', '_search',
    ];
    bindContextToMethods(methodsToBind, this);

    this._getReferences();
    this._init();
    this._setInitialValue();
  }

  /* Public Methods */

  attachListenersToOptions() {
    const optionEls = this._selectEl.querySelectorAll(optionSelector);

    optionEls.forEach(el => {
      el.removeEventListener('click', this._handleOptionClick);
      el.addEventListener('click', this._handleOptionClick);
    });
  }

  get selectedOptionEl() {
    return this._dropdownEl.querySelector(
      `${optionSelector}[data-value="${this.selectedValue}"]`,
    );
  }

  get selectedValue() {
    return this._hiddenInputEl.value;
  }

  get id() {
    return this._id;
  }

  clearSelection() {
    this._hiddenInputEl.value = '';
    this._valueEl.innerHTML = '';
    if (this._finalConfig.retainPlaceholderOnClear) {
      this._placeholderEl.classList.remove('hidden');
    }
  }

  /* Private methods */

  _init() {
    // Show hint if async
    if (this._finalConfig.isAsync && !this._finalConfig.hideHintOnInit) {
      this._hintEl.classList.remove('hidden');
    }

    // Attaching event listeners
    if (this._finalConfig.isCreatable) {
      this._createOptionEl.addEventListener('click', event => {
        const optionEl = event.target.querySelector(optionSelector);
        this._selectOption(optionEl);
      });
    }

    this._selectEl.addEventListener('click', () => {
      this._visibleInputEl.focus();
    });

    this._visibleInputEl.addEventListener('focus', () => {
      this._selectEl.classList.add(focusedClass);
      if (this.selectedOptionEl) {
        this._focusOption(this.selectedOptionEl);
        if (this._finalConfig.showOnlyInputOnFocus) {
          this._valueEl.classList.add('hidden');
        }
      }

      document.body.addEventListener('click', this._handleOutsideClick, false);
    });

    this._visibleInputEl.addEventListener('input', event => {
      if (this._finalConfig.isCreatable) {
        this._setCreateOption(event.target.value);
      }

      const value = (event.target.value || '').toLowerCase();
      if (this._finalConfig.isAsync) {
        this._fetchOptions(value);
      } else if (this._finalConfig.searchable) {
        this._search(value);
      } else {
        // eslint-disable-next-line no-param-reassign
        event.target.value = '';
      }
      if (!value) {
        if (this._finalConfig.showOnlyInputOnFocus) {
          this._valueEl.classList.add('hidden');
        }
      }
    });

    this._visibleInputEl.addEventListener('keydown', event => {
      switch (event.keyCode) {
        case keyCodes.arrowDown:
        case keyCodes.arrowUp:
          this._navigateThroughOptions(
            (event.keyCode === keyCodes.arrowUp)
              ? 'previous'
              : 'next',
          );
          break;
        case keyCodes.enter:
          // Prevent from form getting submitted
          event.preventDefault();
          // Select the focused option
          if (this._focusedOption) {
            this._selectOption(this._focusedOption);
          }
          break;
        case keyCodes.tab:
          this._hideDropdown();
          break;
        default:
          // Do nothing
          break;
      }
    });

    this.attachListenersToOptions();
  }

  _getReferences() {
    this._selectEl = document.getElementById(this._id);
    this._dropdownEl = this._selectEl.querySelector(dropdownSelector);
    this._visibleInputEl = this._selectEl.querySelector(visibleInputSelector);
    this._hiddenInputEl = this._selectEl.querySelector(hiddenInputSelector);
    this._noOptionsEl = this._selectEl.querySelector(noOptionsSelector);
    this._optionsEl = this._selectEl.querySelector(optionsSelector);
    this._loaderEl = this._selectEl.querySelector(loaderSelector);
    this._placeholderEl = this._selectEl.querySelector(placeholderSelector);
    this._valueEl = this._selectEl.querySelector(valueSelector);
    this._hintEl = this._selectEl.querySelector(hintSelector);
    this._createOptionEl = this._selectEl.querySelector(createOptionSelector);
  }

  _fetchOptions(keyword) {
    this._setLoading(true);
    this._toggleControl(keyword);

    this._loadWithDebounce();
  }

  _focusOption(optionEl) {
    const optionEls = this._dropdownEl.querySelectorAll(optionSelector);

    // Unfocus any option that is already focused
    optionEls.forEach(el => el.classList.remove(optionFocusedClass));

    // Focus option and bring it into view if not already in
    optionEl.classList.add(optionFocusedClass);
    const optionTop = optionEl.offsetTop;
    const optionBottom = optionTop + optionEl.offsetHeight;

    const dropdownTop = this._dropdownEl.scrollTop;
    const dropdownBottom = dropdownTop + this._dropdownEl.offsetHeight;

    if (optionTop > dropdownTop && optionBottom < dropdownBottom) {
      // Is already in viewport nothing to do
    } else if (optionTop > dropdownTop) {
      // Option is below viewport
      // We need to change scrollTop such that focused element is the last
      // visible element of the dropdown
      this._dropdownEl.scrollTop = optionBottom - this._dropdownEl.offsetHeight;
    } else {
      // Option is above viewport
      // We need to change scrollTop such that focused element is the first
      // visible element of the dropdown
      this._dropdownEl.scrollTop = optionTop;
    }

    this._focusedOption = optionEl;
  }

  _handleOutsideClick(event) {
    if (!this._selectEl.contains(event.target)) {
      this._hideDropdown();
      this.emit('empty', 'This field is empty');
    }
  }

  _handleOptionClick(event) {
    event.stopPropagation();

    const el = event.currentTarget;
    this._selectOption(el);
    this._finalConfig.onOptionSelect();
  }

  _hideDropdown() {
    this._selectEl.classList.remove(focusedClass);
    // Reset search when hiding dropdown
    this._search('');
    document.body.removeEventListener('click', this._handleOutsideClick, false);
  }

  _loadWithDebounce = debounce(async () => {
    const keyword = this._visibleInputEl.value;
    if (keyword) {
      const options = await this._finalConfig.loadOptions(
        this._visibleInputEl.value,
      );
      this._focusedOption = null;
      this._renderOptions(options);
      this.attachListenersToOptions();
      this._setNoResults(options.length === 0);

      if (this._finalConfig.hideHint) {
        this._hintEl.classList.add('hidden');
      }
    }

    this._setLoading(false);
  }, 200);

  _navigateThroughOptions(direction = 'next') {
    let newOption = this._dropdownEl.querySelector(optionSelector);
    if (this._focusedOption) {
      const isOnCreate = (
        this._focusedOption.getAttribute('data-type') === 'create'
      );
      if (direction === 'next') {
        const nextOption = getNextSibling(
          this._focusedOption,
          ':not(.hidden)',
        );
        if (isOnCreate || !nextOption) {
          newOption = this._dropdownEl.querySelector(
            `${optionsSelector} ${optionSelector}:first-child`,
          );
        } else {
          newOption = nextOption;
        }
      } else {
        const previousOption = getPreviousSibling(
          this._focusedOption,
          ':not(.hidden)',
        );
        if (isOnCreate || !previousOption) {
          newOption = this._dropdownEl.querySelector(
            `${optionsSelector} ${optionSelector}:last-child`,
          );
        } else {
          newOption = previousOption;
        }
      }
    }

    if (newOption) {
      this._focusOption(newOption);
    }
  }

  _renderOptions(options, append = false) {
    let optionsMarkup = ``;
    options.forEach(option => {
      optionsMarkup += fromTemplate(this._finalConfig.optionMarkup, option);
    });

    if (append) {
      this._optionsEl.innerHTML += optionsMarkup;
    } else {
      this._optionsEl.innerHTML = optionsMarkup;
    }
  }

  _selectOption(optionEl) {
    // Update value of the select
    const value = optionEl.getAttribute('data-value');
    const type = optionEl.getAttribute('data-type');
    /**
     * Add value to the underlying main input element and trigger an input
     * event.
     */
    this._hiddenInputEl.value = value;
    this._hiddenInputEl.dispatchEvent(new Event('input', {
      bubbles: true,
      cancelable: true,
    }));
    this.emit('change', value);

    this._placeholderEl.classList.add('hidden');

    if (type === 'create') {
      this._valueEl.innerHTML = `
        <div class="sr-select__option" data-value="${value}">
          ${value}
        </div>`;
      this.emit('create', value);
    } else {
      this._valueEl.innerHTML = optionEl.outerHTML;
    }

    // Update option class to mark it as selected
    const optionEls = this._selectEl.querySelectorAll(optionSelector);
    optionEls.forEach(el => el.classList.remove(optionSelectedClass));
    optionEl.classList.add(optionSelectedClass);

    // Remove focus from input
    this._visibleInputEl.blur();

    // Hide dropdown when user selects an option
    this._hideDropdown();
    this._selectEl.classList.add('sr-select--selected');

    // For Mock coding assessment form
    if (this._finalConfig?.selectCallback) {
      this._finalConfig?.selectCallback({ forceUpdate: true, value });
    }
  }

  // Hide placeholder and value when user start searching
  _search(keyword) {
    // Filter options
    const optionEls = this._selectEl.querySelectorAll(optionSelector);
    let noMatchFound = true;
    optionEls.forEach(el => {
      const optionValue = el.getAttribute('data-value').toLowerCase();
      const isOptionPermenant = el.getAttribute('data-permanent');
      if (optionValue.includes(keyword) || isOptionPermenant === 'true') {
        noMatchFound = false;
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });

    this._setNoResults(noMatchFound);
    this._toggleControl(keyword);
  }

  _setCreateOption(keyword) {
    if (keyword) {
      this._createOptionEl.innerHTML = `
      <div class="sr-select__option" data-value="${keyword}" data-type="create">
        Create option "${keyword}"
      </div>`;
      this._createOptionEl.classList.remove('hidden');
    } else {
      this._createOptionEl.classList.add('hidden');
    }
  }

  _setInitialValue() {
    // Don't do anything if there is no initial value
    if (isNullOrUndefined(this.selectedValue) || this.selectedValue === '') {
      return;
    }

    if (!this.selectedOptionEl) {
      this._renderOptions([{
        value: this.selectedValue,
        label: this.selectedValue,
      }], true);
    }

    this._selectOption(this.selectedOptionEl);
  }

  _setLoading(loading) {
    if (loading) {
      this._loaderEl.classList.add('spinner');
    } else {
      this._loaderEl.classList.remove('spinner');
    }
  }

  _setNoResults(noResults) {
    if (noResults) {
      this._noOptionsEl.classList.remove('hidden');
    } else {
      this._noOptionsEl.classList.add('hidden');
    }
  }

  _toggleControl(keyword) {
    // Show/hide select's placeholder and value
    if (keyword) {
      this._placeholderEl.classList.add('hidden');
      this._valueEl.classList.add('hidden');
    } else {
      this._visibleInputEl.value = '';
      this._valueEl.classList.remove('hidden');
      // Make placeholder visible only if there is no value selected
      if (!this._hiddenInputEl.value) {
        this._placeholderEl.classList.remove('hidden');
      }
    }
  }
}


export default Select;
