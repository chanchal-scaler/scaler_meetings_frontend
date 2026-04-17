const headerStickyClass = 'header_v1--sticky';
const sidebarToggleClass = 'header_v1__burger--active';
const stickySidebarClass = 'header-v1-sidebar__container--show';
const programsDropdownCtaClass = 'header_v1__programs-btn--open';
const programsDropdownModalClass = 'programs-dropdown__container--show';
const dropdownHeaderClass = 'programs-dropdown__content-header--show';
const programsModalCategoriesClass = 'programs-modal__category--highlight';
const programsModalContentClass = 'programs-modal__right--show';
const navModalMargin = 20;
class HeaderV1 {
  constructor() {
    this._initialize();
  }

  _getElements() {
    this.headerEl = document.getElementById('main-header-v1');
    this.scrollEl = document.documentElement;
    this.sidebarToggle = document.querySelector(
      '[data-trigger-id="sidebar-toggle"]',
    );
    this.stickySidebar = document.getElementById('header-v1-sidebar');
    this.programsDropdownCta = document.querySelector(
      '[data-trigger-id="mobile-programs-dropdown-modal-cta"]',
    );
    this.programsDropdownModal = document.getElementById(
      'mobile-programs-dropdown-modal',
    );
    this.dropdownTriggers = document.querySelectorAll(
      '[data-target="dropdown-toggle"]',
    );
    this.navLinkModalTriggers = document.querySelectorAll(
      '[data-target="navlink-modal-toggle"]',
    );
    this.programsModalCategories = document.querySelectorAll('[data-category]');
    this.programsModalContent = document.querySelectorAll('[data-program]');
  }

  _disableBodyScroll = () => {
    this.scrollEl.style.overflow = 'hidden';
  };

  _enableBodyScroll = () => {
    this.scrollEl.style.overflow = null;
  };

  _handleBodyScroll = (target, selectorClass) => {
    if (target.classList.contains(selectorClass)) {
      this._disableBodyScroll();
    } else {
      this._enableBodyScroll();
    }
  };

  _showDropdown = (Dropdown) => {
    const dropdownHeader = Dropdown.querySelector(
      '[data-id="dropdown-header"]',
    );
    const dropdownContent = Dropdown.querySelector(
      '[data-id="dropdown-content"]',
    );
    dropdownHeader?.classList.toggle(dropdownHeaderClass);
    if (dropdownContent.style.height === '') {
      dropdownContent.style.height = `${dropdownContent.scrollHeight}px`;
    } else {
      dropdownContent.style.height = '';
    }
  };

  _showProgramsModal = (programCategory) => {
    this.programsModalContent?.forEach((programContent) => {
      if (programCategory.dataset.category === programContent.dataset.program) {
        programContent.classList.add(programsModalContentClass);
        programCategory.classList.add(programsModalCategoriesClass);
      } else {
        programContent.classList.remove(programsModalContentClass);
      }
    });

    this.programsModalCategories?.forEach((otherCategory) => {
      if (otherCategory !== programCategory) {
        otherCategory.classList.remove(programsModalCategoriesClass);
      }
    });
  };

  _onScroll = () => {
    if (this.scrollEl.scrollTop >= this.headerEl?.offsetHeight) {
      this.headerEl?.classList.add(headerStickyClass);
    } else {
      this.headerEl?.classList.remove(headerStickyClass);
    }
  };

  /* function to make all the navmodals responsive for every screen size */
  _positionNavModal = () => {
    this.navLinkModalTriggers?.forEach((navLinkModalTrigger) => {
      const modalTriggerOffSet = navLinkModalTrigger.getBoundingClientRect();
      const navLinkModal = navLinkModalTrigger.querySelector(
        '[data-modal="navlink-modal"]',
      );
      const modalSize = navLinkModal?.getAttribute('data-modal-size');
      const modalSpaceRequired = modalSize === 'large'
        ? navLinkModal.offsetWidth - navLinkModalTrigger.offsetWidth
        : navLinkModal.offsetWidth / 2;
      // eslint-disable-next-line max-len
      const modalSpaceLeft = window.innerWidth - modalTriggerOffSet.right - navModalMargin;
      navLinkModal.style.transform = `translateX(${
        Math.min(modalSpaceRequired, modalSpaceLeft)
      }px)`;
    });
  };

  _listenEvents() {
    this.dropdownTriggers?.forEach((Dropdown) => {
      Dropdown.addEventListener('click', () => this._showDropdown(Dropdown));
    });

    this.programsDropdownCta?.addEventListener('click', () => {
      this.sidebarToggle?.classList.remove(sidebarToggleClass);
      this.stickySidebar?.classList.remove(stickySidebarClass);
      this.programsDropdownCta?.classList.toggle(programsDropdownCtaClass);
      this.programsDropdownModal?.classList.toggle(programsDropdownModalClass);
      this._handleBodyScroll(
        this.programsDropdownModal, programsDropdownModalClass,
      );
    });

    this.sidebarToggle?.addEventListener('click', () => {
      this.programsDropdownCta?.classList.remove(programsDropdownCtaClass);
      this.programsDropdownModal?.classList.remove(programsDropdownModalClass);
      this.sidebarToggle?.classList.toggle(sidebarToggleClass);
      this.stickySidebar?.classList.toggle(stickySidebarClass);
      this._handleBodyScroll(this.stickySidebar, stickySidebarClass);
    });

    this.programsModalCategories?.forEach((programCategory) => {
      programCategory.addEventListener('mouseover', () => {
        this._showProgramsModal(programCategory);
      });
    });

    this._positionNavModal();
    window.addEventListener('resize', this._positionNavModal);
    window.addEventListener('scroll', this._onScroll);
  }

  _initialize() {
    this._getElements();
    this._listenEvents();
  }
}

export default HeaderV1;
