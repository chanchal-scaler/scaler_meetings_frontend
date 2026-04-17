const VSBoxCounter = (function () {
  let count = 0;
  let instances = [];
  return {
    set(instancePtr) {
      instances.push({ offset: count += 1, ptr: instancePtr });
      return instances[instances.length - 1].offset;
    },
    remove(instanceNr) {
      const temp = instances.filter(x => x.offset !== instanceNr);
      instances = temp.splice(0);
    },
    closeAllButMe(instanceNr) {
      instances.forEach(x => {
        if (x.offset !== instanceNr) {
          x.ptr.closeOrder();
        }
      });
    },
  };
}());

function vanillaSelectBox(domSelector, options) {
  const self = this;
  this.instanceOffset = VSBoxCounter.set(self);
  this.domSelector = domSelector;
  this.root = document.querySelector(domSelector);
  this.rootToken = null;
  this.isMultiple = this.root.hasAttribute('multiple');
  this.multipleSize = this.isMultiple && this.root.hasAttribute('size')
    ? parseInt(this.root.getAttribute('size'), 10)
    : -1;
  this.isDisabled = false;
  this.search = false;
  this.searchZone = null;
  this.inputBox = null;
  this.disabledItems = [];
  this.ulminWidth = 140;
  this.ulmaxWidth = 280;
  this.ulminHeight = 25;
  this.maxOptionWidth = Infinity;
  this.maxSelect = Infinity;
  this.isInitRemote = false;
  this.onInit = null;
  this.onSearch = null;
  this.onInitSize = null;
  this.forbidenAttributes = [
    'class',
    'selected',
    'disabled',
    'data-text',
    'data-value',
    'style',
  ];
  this.forbidenClasses = ['active', 'disabled'];
  this.userOptions = {
    maxWidth: '100%',
    minWidth: -1,
    maxHeight: 400,
    translations: {
      all: 'All',
      item: 'item',
      items: 'items',
      selectAll: 'Select All',
      clearAll: 'Clear All',
    },
    search: false,
    placeHolder: 'My question(s) are',
    stayOpen: false,
    disableSelectAll: false,
    buttonItemsSeparator: ' | ',
  };
  if (options) {
    if (options.itemsSeparator !== undefined) {
      this.userOptions.buttonItemsSeparator = options.itemsSeparator;
    }
    if (options.maxWidth !== undefined) {
      this.userOptions.maxWidth = options.maxWidth;
    }
    if (options.minWidth !== undefined) {
      this.userOptions.minWidth = options.minWidth;
    }
    if (options.maxHeight !== undefined) {
      this.userOptions.maxHeight = options.maxHeight;
    }
    if (options.translations !== undefined) {
      // eslint-disable-next-line no-restricted-syntax
      for (const property in options.translations) {
        // eslint-disable-next-line no-prototype-builtins
        if (options.translations.hasOwnProperty(property)) {
          if (this.userOptions.translations[property]) {
            this.userOptions.translations[property] = (
              options.translations[property]
            );
          }
        }
      }
    }
    if (options.placeHolder !== undefined) {
      this.userOptions.placeHolder = options.placeHolder;
    }
    if (options.search !== undefined) {
      this.search = options.search;
    }
    if (options.remote !== undefined && options.remote) {
      // user defined onInit  function
      if (
        options.remote.onInit !== undefined
        && typeof options.remote.onInit === 'function'
      ) {
        this.onInit = options.remote.onInit;
        this.isInitRemote = true;
      }
      if (options.remote.onInitSize !== undefined) {
        this.onInitSize = options.remote.onInitSize;
        if (this.onInitSize < 3) this.onInitSize = 3;
      }
      // user defined remote search function
      if (
        options.remote.onSearch !== undefined
        && typeof options.remote.onSearch === 'function'
      ) {
        this.onSearch = options.remote.onSearch;
        // this.isSearchRemote = true;
      }
    }

    if (options.stayOpen !== undefined) {
      this.userOptions.stayOpen = options.stayOpen;
    }

    if (options.disableSelectAll !== undefined) {
      this.userOptions.disableSelectAll = options.disableSelectAll;
    }

    if (
      options.maxSelect !== undefined
      // eslint-disable-next-line no-restricted-globals
      && !isNaN(options.maxSelect)
      && options.maxSelect >= 1
    ) {
      this.maxSelect = options.maxSelect;
      this.userOptions.disableSelectAll = true;
    }

    if (
      options.maxOptionWidth !== undefined
      // eslint-disable-next-line no-restricted-globals
      && !isNaN(options.maxOptionWidth)
      && options.maxOptionWidth >= 20
    ) {
      this.maxOptionWidth = options.maxOptionWidth;
      this.ulminWidth = options.maxOptionWidth + 60;
      this.ulmaxWidth = options.maxOptionWidth + 60;
    }
  }

  this.closeOrder = function () {
    // let self = this;
    if (!self.userOptions.stayOpen) {
      self.drop.style.visibility = 'hidden';
      if (self.search) {
        self.inputBox.value = '';
        Array.prototype.slice.call(self.listElements).forEach(x => {
          x.classList.remove('hide');
        });
      }
    }
  };

  this.init = function () {
    // let self = this;
    if (self.isInitRemote) {
      self.onInit('', self.onInitSize).then(data => {
        self.buildSelect(data);
        self.createTree();
      });
    } else {
      self.createTree();
    }
  };

  this.createTree = function () {
    this.rootToken = self.domSelector.replace(/[^A-Za-z0-9]+/, '');
    this.root.style.display = 'none';
    const already = document.getElementById(`btn-group-${this.rootToken}`);
    if (already) {
      already.remove();
    }
    this.main = document.createElement('div');
    this.root.parentNode.insertBefore(this.main, this.root.nextSibling);
    this.main.classList.add('sr-multiselect');
    this.main.setAttribute('id', `btn-group-${this.rootToken}`);
    // this.main.style.marginLeft = this.main.style.marginLeft;
    if (self.userOptions.stayOpen) {
      this.main.style.minHeight = `${this.userOptions.maxHeight + 10}px`;
    }

    if (self.userOptions.stayOpen) {
      this.button = document.createElement('div');
    } else {
      this.button = document.createElement('button');
    }
    this.button.style.maxWidth = `${this.userOptions.maxWidth}px`;
    if (this.userOptions.minWidth !== -1) {
      this.button.style.minWidth = `${this.userOptions.minWidth}px`;
    }

    this.button.classList.add('sr-multiselect__control');
    this.main.appendChild(this.button);
    this.title = document.createElement('span');
    this.button.appendChild(this.title);
    this.title.classList.add('sr-multiselect__title');
    const arrow = document.createElement('span');
    this.button.appendChild(arrow);

    arrow.classList.add('icon-chevron-down');
    arrow.style.position = 'absolute';
    arrow.style.right = '1rem';

    if (self.userOptions.stayOpen) {
      arrow.style.display = 'none';
      this.title.style.paddingLeft = '20px';
      this.title.style.fontStyle = 'italic';
      this.title.style.verticalAlign = '20%';
    }

    this.drop = document.createElement('div');
    this.main.appendChild(this.drop);
    this.drop.classList.add('sr-multiselect__dropdown');
    this.drop.style.zIndex = 2000 - this.instanceOffset;
    this.ul = document.createElement('ul');
    this.drop.appendChild(this.ul);

    this.ul.style.maxHeight = `${this.userOptions.maxHeight}px`;
    this.ul.style.minHeight = `${this.ulminHeight}px`;
    if (this.isMultiple) {
      this.ul.classList.add('sr-multiselect__multi-options');
      if (!self.userOptions.disableSelectAll) {
        const selectAll = document.createElement('option');
        selectAll.setAttribute('value', 'all');
        selectAll.innerText = self.userOptions.translations.selectAll;
        this.root.insertBefore(
          selectAll,
          this.root.hasChildNodes() ? this.root.childNodes[0] : null,
        );
      }
    }
    let selectedTexts = '';
    let sep = '';
    let nrActives = 0;

    if (this.search) {
      this.searchZone = document.createElement('div');
      this.ul.appendChild(this.searchZone);
      this.searchZone.classList.add('sr-multiselect__search');
      this.searchZone.style.zIndex = 2001 - this.instanceOffset;
      this.inputBox = document.createElement('input');
      this.searchZone.appendChild(this.inputBox);
      this.inputBox.setAttribute('type', 'text');
      this.inputBox.setAttribute('id', `search_${this.rootToken}`);
      if (this.maxOptionWidth < Infinity) {
        this.searchZone.style.maxWidth = `${self.maxOptionWidth + 30}px`;
        this.inputBox.style.maxWidth = `${self.maxOptionWidth + 30}px`;
      }

      this.ul.addEventListener('scroll', function () {
        const y = this.scrollTop;
        self.searchZone.parentNode.style.top = `${y}px`;
      });
    }

    this.options = document.querySelectorAll(`${this.domSelector} > option`);
    Array.prototype.slice.call(this.options).forEach(x => {
      const text = x.textContent;
      const { value } = x;
      let originalAttrs;
      if (x.hasAttributes()) {
        originalAttrs = Array.prototype.slice
          .call(x.attributes)
          .filter(a => self.forbidenAttributes.indexOf(a.name) === -1);
      }
      let classes = x.getAttribute('class');
      if (classes) {
        classes = classes.split(' ')
          .filter(c => self.forbidenClasses.indexOf(c) === -1);
      } else {
        classes = [];
      }
      const li = document.createElement('li');
      li.classList.add('sr-multiselect__option-item');
      const isSelected = x.hasAttribute('selected');
      const isDisabled = x.hasAttribute('disabled');

      self.ul.appendChild(li);
      li.setAttribute('data-value', value);
      li.setAttribute('data-text', text);

      if (originalAttrs !== undefined) {
        originalAttrs.forEach((a) => {
          li.setAttribute(a.name, a.value);
        });
      }

      classes.forEach((e) => {
        li.classList.add(e);
      });

      if (self.maxOptionWidth < Infinity) {
        li.classList.add('short');
        li.style.maxWidth = `${self.maxOptionWidth}px`;
      }

      if (isSelected) {
        nrActives += 1;
        selectedTexts += sep + text;
        sep = self.userOptions.buttonItemsSeparator;
        li.classList.add('active');
        if (!self.isMultiple) {
          self.title.textContent = text;
          if (classes.length !== 0) {
            classes.forEach((e) => {
              self.title.classList.add(e);
            });
          }
        }
      }
      if (isDisabled) {
        li.classList.add('disabled');
      }
      li.appendChild(document.createTextNode(` ${text}`));
    });

    const optionsLength = (
      self.options.length - Number(!self.userOptions.disableSelectAll)
    );

    if (optionsLength === nrActives) {
      // Bastoune idea to preserve the placeholder
      const wordForAll = self.userOptions.translations.all;
      selectedTexts = wordForAll;
    } else if (self.multipleSize !== -1) {
      if (nrActives > self.multipleSize) {
        const wordForItems = nrActives === 1
          ? self.userOptions.translations.item
          : self.userOptions.translations.items;
        selectedTexts = `${nrActives} ${wordForItems}`;
      }
    }
    if (self.isMultiple) {
      self.title.innerHTML = selectedTexts;
    }
    if (self.userOptions.placeHolder !== '' && self.title.textContent === '') {
      self.title.textContent = self.userOptions.placeHolder;
    }
    self.listElements = self.drop.querySelectorAll(
      'li:not(.sr-multiselect__option-item--grouped)',
    );
    if (self.search) {
      self.inputBox.addEventListener('keyup', (e) => {
        const searchValue = e.target.value.toUpperCase();
        const searchValueLength = searchValue.length;
        let nrFound = 0;
        let nrChecked = 0;
        let selectAll = null;
        if (searchValueLength < 3) {
          Array.prototype.slice.call(self.listElements).forEach((x) => {
            if (x.getAttribute('data-value') === 'all') {
              selectAll = x;
            } else {
              x.classList.remove('hidden-search');
              nrFound += 1;
              nrChecked += x.classList.contains('active');
            }
          });
        } else {
          Array.prototype.slice.call(self.listElements).forEach((x) => {
            if (x.getAttribute('data-value') !== 'all') {
              const text = x.getAttribute('data-text').toUpperCase();
              if (
                text.indexOf(searchValue) === -1
                && x.getAttribute('data-value') !== 'all'
              ) {
                x.classList.add('hidden-search');
              } else {
                nrFound += 1;
                x.classList.remove('hidden-search');
                nrChecked += x.classList.contains('active');
              }
            } else {
              selectAll = x;
            }
          });
        }
        if (selectAll) {
          if (nrFound === 0) {
            selectAll.classList.add('disabled');
          } else {
            selectAll.classList.remove('disabled');
          }
          if (nrChecked !== nrFound) {
            selectAll.classList.remove('active');
            selectAll.innerText = self.userOptions.translations.selectAll;
            selectAll.setAttribute('data-selected', 'false');
          } else {
            selectAll.classList.add('active');
            selectAll.innerText = self.userOptions.translations.clearAll;
            selectAll.setAttribute('data-selected', 'true');
          }
        }
      });
    }

    function hideMultiSelectDropDown() {
      self.drop.style.visibility = 'hidden';
      self.main.removeEventListener('click', hideMultiSelectDropDown);
    }

    function docListener() {
      document.removeEventListener('click', docListener);
      self.main.removeEventListener('click', hideMultiSelectDropDown);
      self.drop.style.visibility = 'hidden';
      if (self.search) {
        self.inputBox.value = '';
        Array.prototype.slice.call(self.listElements).forEach((x) => {
          x.classList.remove('hidden-search');
        });
      }
    }

    if (self.userOptions.stayOpen) {
      self.drop.style.visibility = 'visible';
      self.drop.style.boxShadow = 'none';
      self.drop.style.minHeight = `${this.userOptions.maxHeight + 10}px`;
      self.drop.style.position = 'relative';
      self.drop.style.left = '0px';
      self.drop.style.top = '0px';
      self.button.style.border = 'none';
    } else {
      this.main.addEventListener('click', (e) => {
        if (self.isDisabled) return;
        self.drop.style.visibility = 'visible';
        document.addEventListener('click', docListener);
        this.main.addEventListener('click', hideMultiSelectDropDown);
        e.preventDefault();
        e.stopPropagation();
        if (!self.userOptions.stayOpen) {
          VSBoxCounter.closeAllButMe(self.instanceOffset);
        }
      });
    }

    this.drop.addEventListener('click', (e) => {
      if (self.isDisabled) return;
      if (e.target.tagName === 'INPUT') return;
      const isShowHideCommand = e.target.tagName === 'SPAN';
      const isCheckCommand = e.target.tagName === 'I';
      const liClicked = e.target.parentElement;
      if (!liClicked.hasAttribute('data-value')) {
        if (
          liClicked.classList.contains('sr-multiselect__option-item--grouped')
        ) {
          if (!isShowHideCommand && !isCheckCommand) return;
          let oldClass; let
            newClass;
          if (isCheckCommand) {
            // check or uncheck children
            self.checkUncheckFromParent(liClicked);
          } else {
            // open or close
            if (liClicked.classList.contains('open')) {
              oldClass = 'open';
              newClass = 'closed';
            } else {
              oldClass = 'closed';
              newClass = 'open';
            }
            liClicked.classList.remove(oldClass);
            liClicked.classList.add(newClass);
            const theChildren = self.drop.querySelectorAll(
              `[data-parent='${liClicked.id}']`,
            );
            theChildren.forEach((x) => {
              x.classList.remove(oldClass);
              x.classList.add(newClass);
            });
          }
          return;
        }
      }
      const choiceValue = e.target.getAttribute('data-value');
      const choiceText = e.target.getAttribute('data-text');
      const className = e.target.getAttribute('class');

      if (className && className.indexOf('disabled') !== -1) {
        return;
      }

      if (className && className.indexOf('overflow') !== -1) {
        return;
      }

      if (choiceValue === 'all') {
        if (
          e.target.hasAttribute('data-selected')
          && e.target.getAttribute('data-selected') === 'true'
        ) {
          self.setValue('none');
        } else {
          self.setValue('all');
        }
        return;
      }

      if (!self.isMultiple) {
        self.root.value = choiceValue;
        self.title.textContent = choiceText;
        if (className) {
          self.title.setAttribute('class', `${className} title`);
        } else {
          self.title.setAttribute('class', 'title');
        }
        Array.prototype.slice.call(self.listElements).forEach((x) => {
          x.classList.remove('active');
        });
        if (choiceText !== '') {
          e.target.classList.add('active');
        }
        self.privateSendChange();
        if (!self.userOptions.stayOpen) {
          docListener();
        }
      } else {
        let wasActive = false;
        if (className) {
          wasActive = className.indexOf('active') !== -1;
        }
        if (wasActive) {
          e.target.classList.remove('active');
        } else {
          e.target.classList.add('active');
        }
        if (e.target.hasAttribute('data-parent')) {
          self.checkUncheckFromChild(e.target);
        }

        selectedTexts = '';
        sep = '';
        nrActives = 0;
        let nrAll = 0;
        for (let i = 0; i < self.options.length; i += 1) {
          nrAll += 1;
          if (self.options[i].value === choiceValue) {
            self.options[i].selected = !wasActive;
          }
          if (self.options[i].selected) {
            nrActives += 1;
            selectedTexts += sep + self.options[i].textContent;
            sep = self.userOptions.buttonItemsSeparator;
          }
        }
        if (nrAll === nrActives - Number(!self.userOptions.disableSelectAll)) {
          const wordForAll = self.userOptions.translations.all;
          selectedTexts = wordForAll;
        } else if (self.multipleSize !== -1) {
          if (nrActives > self.multipleSize) {
            const wordForItems = nrActives === 1
              ? self.userOptions.translations.item
              : self.userOptions.translations.items;
            selectedTexts = `${nrActives} ${wordForItems}`;
          }
        }
        self.title.textContent = selectedTexts;
        self.checkSelectMax(nrActives);
        self.checkUncheckAll();
        self.privateSendChange();
      }
      e.preventDefault();
      e.stopPropagation();
      if (
        self.userOptions.placeHolder !== ''
        && self.title.textContent === ''
      ) {
        self.title.textContent = self.userOptions.placeHolder;
      }
    });

    document.addEventListener('reset-selection', () => { self.empty(); });
  };

  Object.defineProperty(this.root, 'value', {
    get: () => [...this.root.options]
      .filter(option => option.selected)
      .map(option => option.value),
  });

  this.init();
  self.checkUncheckAll();
}

vanillaSelectBox.prototype.checkUncheckAll = function () {
  const self = this;
  if (!self.isMultiple) return;
  let nrChecked = 0;
  let nrCheckable = 0;
  let checkAllElement = null;
  if (self.listElements === null) return;
  Array.prototype.slice.call(self.listElements).forEach((x) => {
    if (x.hasAttribute('data-value')) {
      if (x.getAttribute('data-value') === 'all') {
        checkAllElement = x;
      }
      if (
        x.getAttribute('data-value') !== 'all'
        && !x.classList.contains('hidden-search')
        && !x.classList.contains('disabled')
      ) {
        nrCheckable += 1;
        nrChecked += x.classList.contains('active');
      }
    }
  });

  if (checkAllElement) {
    if (nrChecked === nrCheckable) {
      // check the checkAll checkbox
      self.title.textContent = self.userOptions.translations.all;
      checkAllElement.classList.add('active');
      checkAllElement.innerText = self.userOptions.translations.clearAll;
      checkAllElement.setAttribute('data-selected', 'true');
    } else if (nrChecked === 0) {
      // uncheck the checkAll checkbox
      self.title.textContent = self.userOptions.placeHolder;
      checkAllElement.classList.remove('active');
      checkAllElement.innerText = self.userOptions.translations.selectAll;
      checkAllElement.setAttribute('data-selected', 'false');
    }
  }
};

vanillaSelectBox.prototype.buildSelect = function (data) {
  const self = this;
  if (data === null || data.length < 1) return;

  data.forEach((x) => {
    const anOption = document.createElement('option');
    anOption.value = x.value;
    anOption.text = x.text;
    if (x.selected) {
      anOption.setAttribute('selected', true);
    }
    self.root.appendChild(anOption);
  });
};

vanillaSelectBox.prototype.optionsCheckedToData = function () {
  const self = this;
  const dataChecked = [];
  const treeOptions = self.ul.querySelectorAll(
    'li.active:not(.sr-multiselect__option-item--grouped)',
  );
  // const keepParents = {};
  if (treeOptions) {
    Array.prototype.slice.call(treeOptions).forEach((x) => {
      const oneData = {
        value: x.getAttribute('data-value'),
        text: x.getAttribute('data-text'),
        selected: true,
      };
      if (oneData.value !== 'all') {
        dataChecked.push(oneData);
      }
    });
  }
  return dataChecked;
};

vanillaSelectBox.prototype.removeOptionsNotChecked = function (data) {
  const self = this;
  const minimumSize = self.onInitSize;
  const newSearchSize = data === null ? 0 : data.length;
  const presentSize = self.root.length;
  if (presentSize + newSearchSize > minimumSize) {
    const maxToRemove = presentSize + newSearchSize - minimumSize - 1;
    let removed = 0;
    for (let i = self.root.length - 1; i >= 0; i -= 1) {
      if (self.root.options[i].selected === false) {
        if (removed <= maxToRemove) {
          removed += 1;
          self.root.remove(i);
        }
      }
    }
  }
};

function vanillaSelectBoxType(target) {
  const computedType = Object.prototype.toString.call(target);
  const stripped = computedType.replace('[object ', '').replace(']', '');
  const lowercased = stripped.toLowerCase();
  return lowercased;
}
vanillaSelectBox.prototype.disableItems = function (values) {
  const self = this;
  const foundValues = [];
  if (vanillaSelectBoxType(values) === 'string') {
    values = values.split(','); // eslint-disable-line no-param-reassign
  }

  if (vanillaSelectBoxType(values) === 'array') {
    Array.prototype.slice.call(self.options).forEach((x) => {
      if (values.indexOf(x.value) !== -1) {
        foundValues.push(x.value);
        x.setAttribute('disabled', '');
      }
    });
  }
  Array.prototype.slice.call(self.listElements).forEach((x) => {
    const val = x.getAttribute('data-value');
    if (foundValues.indexOf(val) !== -1) {
      x.classList.add('disabled');
    }
  });
};

vanillaSelectBox.prototype.enableItems = function (values) {
  const self = this;
  const foundValues = [];
  if (vanillaSelectBoxType(values) === 'string') {
    values = values.split(','); // eslint-disable-line no-param-reassign
  }

  if (vanillaSelectBoxType(values) === 'array') {
    Array.prototype.slice.call(self.options).forEach((x) => {
      if (values.indexOf(x.value) !== -1) {
        foundValues.push(x.value);
        x.removeAttribute('disabled');
      }
    });
  }

  Array.prototype.slice.call(self.listElements).forEach((x) => {
    if (foundValues.indexOf(x.getAttribute('data-value')) !== -1) {
      x.classList.remove('disabled');
    }
  });
};

vanillaSelectBox.prototype.checkSelectMax = function (nrActives) {
  const self = this;
  if (self.maxSelect === Infinity || !self.isMultiple) return;
  if (self.maxSelect <= nrActives) {
    Array.prototype.slice.call(self.listElements).forEach((x) => {
      if (x.hasAttribute('data-value')) {
        if (
          !x.classList.contains('disabled')
          && !x.classList.contains('active')
        ) {
          x.classList.add('overflow');
        }
      }
    });
  } else {
    Array.prototype.slice.call(self.listElements).forEach((x) => {
      if (x.classList.contains('overflow')) {
        x.classList.remove('overflow');
      }
    });
  }
};

vanillaSelectBox.prototype.checkUncheckFromChild = function (liClicked) {
  const self = this;
  const parentId = liClicked.getAttribute('data-parent');
  const parentLi = document.getElementById(parentId);
  if (!self.isMultiple) return;
  const listElements = self.drop.querySelectorAll('li');
  const childrenElements = Array.prototype.slice
    .call(listElements)
    .filter((el) => (
      el.hasAttribute('data-parent')
        && el.getAttribute('data-parent') === parentId
        && !el.classList.contains('hidden-search')
    ));
  let nrChecked = 0;
  const nrCheckable = childrenElements.length;
  if (nrCheckable === 0) return;
  childrenElements.forEach((el) => {
    if (el.classList.contains('active')) nrChecked += 1;
  });
  if (nrChecked === nrCheckable || nrChecked === 0) {
    if (nrChecked === 0) {
      parentLi.classList.remove('checked');
    } else {
      parentLi.classList.add('checked');
    }
  } else {
    parentLi.classList.remove('checked');
  }
};

vanillaSelectBox.prototype.checkUncheckFromParent = function (liClicked) {
  const self = this;
  const parentId = liClicked.id;
  if (!self.isMultiple) return;
  const listElements = self.drop.querySelectorAll('li');
  const childrenElements = Array.prototype.slice
    .call(listElements)
    .filter((el) => (
      el.hasAttribute('data-parent')
        && el.getAttribute('data-parent') === parentId
        && !el.classList.contains('hidden-search')
    ));
  let nrChecked = 0;
  const nrCheckable = childrenElements.length;
  if (nrCheckable === 0) return;
  childrenElements.forEach((el) => {
    if (el.classList.contains('active')) nrChecked += 1;
  });
  if (nrChecked === nrCheckable || nrChecked === 0) {
    // check all or uncheckAll : just do the opposite
    childrenElements.forEach((el) => {
      const event = document.createEvent('HTMLEvents');
      event.initEvent('click', true, false);
      el.dispatchEvent(event);
    });
    if (nrChecked === 0) {
      liClicked.classList.add('checked');
    } else {
      liClicked.classList.remove('checked');
    }
  } else {
    // check all
    liClicked.classList.remove('checked');
    childrenElements.forEach((el) => {
      if (!el.classList.contains('active')) {
        const event = document.createEvent('HTMLEvents');
        event.initEvent('click', true, false);
        el.dispatchEvent(event);
      }
    });
  }
};

vanillaSelectBox.prototype.setValue = function (values) {
  const self = this;
  const listElements = self.drop.querySelectorAll('li');

  if (values === null || values === undefined || values === '') {
    self.empty();
  } else if (self.isMultiple) {
    if (vanillaSelectBoxType(values) === 'string') {
      if (values === 'all') {
        values = []; // eslint-disable-line no-param-reassign
        Array.prototype.slice.call(listElements).forEach((x) => {
          if (x.hasAttribute('data-value')) {
            const value = x.getAttribute('data-value');
            if (value !== 'all') {
              if (
                !x.classList.contains('hidden-search')
                  && !x.classList.contains('disabled')
              ) {
                values.push(x.getAttribute('data-value'));
              }
              // already checked (but hidden by search)
              if (x.classList.contains('active')) {
                if (
                  x.classList.contains('hidden-search')
                    || x.classList.contains('disabled')
                ) {
                  values.push(value);
                }
              }
            } else {
              x.classList.add('active');
            }
          } else if (
            x.classList.contains('sr-multiselect__option-item--grouped')
          ) {
            x.classList.add('checked');
          }
        });
      } else if (values === 'none') {
        values = []; // eslint-disable-line no-param-reassign
        Array.prototype.slice.call(listElements).forEach((x) => {
          if (x.hasAttribute('data-value')) {
            const value = x.getAttribute('data-value');
            if (value !== 'all') {
              if (x.classList.contains('active')) {
                if (
                  x.classList.contains('hidden-search')
                    || x.classList.contains('disabled')
                ) {
                  values.push(value);
                }
              }
            }
          } else if (
            x.classList.contains('sr-multiselect__option-item--grouped')
          ) {
            x.classList.remove('checked');
          }
        });
      } else {
        values = values.split(','); // eslint-disable-line no-param-reassign
      }
    }
    const foundValues = [];
    if (vanillaSelectBoxType(values) === 'array') {
      Array.prototype.slice.call(self.options).forEach((e) => {
        if (values.indexOf(e.value) !== -1) {
          e.selected = true;
          foundValues.push(e.value);
        } else {
          e.selected = false;
        }
      });
      let selectedTexts = '';
      let sep = '';
      let nrActives = 0;
      let nrAll = 0;
      Array.prototype.slice.call(listElements).forEach((x) => {
        if (x.value !== 'all') {
          nrAll += 1;
        }
        if (foundValues.indexOf(x.getAttribute('data-value')) !== -1) {
          x.classList.add('active');
          nrActives += 1;
          selectedTexts += sep + x.getAttribute('data-text');
          sep = self.userOptions.buttonItemsSeparator;
        } else {
          x.classList.remove('active');
        }
      });
      if (nrAll === nrActives - Number(!self.userOptions.disableSelectAll)) {
        const wordForAll = self.userOptions.translations.all;
        selectedTexts = wordForAll;
      } else if (self.multipleSize !== -1) {
        if (nrActives > self.multipleSize) {
          const wordForItems = nrActives === 1
            ? self.userOptions.translations.item
            : self.userOptions.translations.items;
          selectedTexts = `${nrActives} ${wordForItems}`;
        }
      }
      self.title.textContent = selectedTexts;
      self.privateSendChange();
    }
    self.checkUncheckAll();
  } else {
    let found = false;
    let text = '';
    let className = '';
    Array.prototype.slice.call(listElements).forEach((x) => {
      const liVal = x.getAttribute('data-value') === values;
      if (liVal !== 'all') {
        if (liVal === values) {
          x.classList.add('active');
          found = true;
          text = x.getAttribute('data-text');
        } else {
          x.classList.remove('active');
        }
      }
    });
    Array.prototype.slice.call(self.options).forEach((x) => {
      if (x.value === values) {
        x.selected = true; // eslint-disable-line no-param-reassign
        className = x.getAttribute('class');
        if (!className) className = '';
      } else {
        x.selected = false; // eslint-disable-line no-param-reassign
      }
    });
    if (found) {
      self.title.textContent = text;
      if (
        self.userOptions.placeHolder !== ''
          && self.title.textContent === ''
      ) {
        self.title.textContent = self.userOptions.placeHolder;
      }
      if (className !== '') {
        self.title.setAttribute('class', `${className} title`);
      } else {
        self.title.setAttribute('class', 'title');
      }
    }
  }
};

vanillaSelectBox.prototype.privateSendChange = function () {
  const event = document.createEvent('HTMLEvents');
  event.initEvent('change', true, false);
  this.root.dispatchEvent(event);
};

vanillaSelectBox.prototype.empty = function () {
  const self = this;
  Array.prototype.slice.call(this.listElements).forEach((x) => {
    x.classList.remove('active');
  });
  const parentElements = this.drop.querySelectorAll(
    'li.sr-multiselect__option-item--grouped',
  );
  if (parentElements) {
    Array.prototype.slice.call(parentElements).forEach((x) => {
      x.classList.remove('checked');
    });
  }
  Array.prototype.slice.call(this.options).forEach((x) => {
    x.selected = false; // eslint-disable-line no-param-reassign
  });
  this.title.textContent = '';
  if (this.userOptions.placeHolder !== '' && this.title.textContent === '') {
    this.title.textContent = this.userOptions.placeHolder;
  }
  self.checkUncheckAll();
  self.privateSendChange();
};

vanillaSelectBox.prototype.destroy = function () {
  const already = document.getElementById(`btn-group-${this.rootToken}`);
  if (already) {
    VSBoxCounter.remove(this.instanceOffset);
    already.remove();
    this.root.style.display = 'inline-block';
  }
};

vanillaSelectBox.prototype.disable = function () {
  const already = document.getElementById(`btn-group-${this.rootToken}`);
  if (already) {
    const button = already.querySelector('button');
    if (button) button.classList.add('disabled');
    this.isDisabled = true;
  }
};

vanillaSelectBox.prototype.enable = function () {
  const already = document.getElementById(`btn-group-${this.rootToken}`);
  if (already) {
    const button = already.querySelector('button');
    if (button) button.classList.remove('disabled');
    this.isDisabled = false;
  }
};

// vanillaSelectBox.prototype.showOptions = function () {
//   console.log(this.userOptions);
// };
// Polyfills for IE
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function () {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

export default { Initialize: vanillaSelectBox };
