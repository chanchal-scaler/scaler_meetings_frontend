import throttle from 'lodash/throttle';

import { isInViewport } from '@common/utils/dom';

const burgerButtonClass = 'burger';
const burgerOpenButtonClass = 'burger--active';
const burgerOpenHeaderClass = 'header--burger-open';
const headerSpacerClassSuffix = 'header-spacer';
const headerStickyClass = 'header--sticky';
const headerStickyAnimationClass = 'slide-in-down';
const navItemClass = 'header__nav-item';
const navItemActiveClass = 'header__nav-item--active';
const ribbonClass = 'header__ribbon';
const ribbonHideClass = 'header__ribbon--hidden';

const defaultOptions = {
  inPageLinks: false,
  sticky: false,
  navNodeFilter: null,
};

const minScrollDistance = 30;

class Header {
  constructor(id, options = {}) {
    this._headerId = id;
    this._options = { ...defaultOptions, ...options };
    this._scrollEl = document.documentElement;

    this._getElements();
    this._init();
    this._onScroll();
  }

  /* Public methods/getters */

  /* Call this if your header is removed from DOM */
  dispose() {
    window.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('scroll', this._onScrollEnd);
  }

  isBurgerOpen() {
    return this._headerEl.classList.contains(burgerOpenHeaderClass);
  }

  isRibbonHidden() {
    return this._ribbonEl.classList.contains(ribbonHideClass);
  }

  openBurger = () => {
    this._headerEl.classList.add(burgerOpenHeaderClass);
    this._burgerButtonEl.classList.add(burgerOpenButtonClass);
  }

  closeBurger = () => {
    this._headerEl.classList.remove(burgerOpenHeaderClass);
    this._burgerButtonEl.classList.remove(burgerOpenButtonClass);
  }

  toggleBurger = () => {
    if (this.isBurgerOpen()) {
      this.closeBurger();
    } else {
      this.openBurger();
    }
  }

  hideRibbon() {
    this._ribbonEl.classList.add(ribbonHideClass);
  }

  showRibbon() {
    this._ribbonEl.classList.remove(ribbonHideClass);
  }

  get hasInPageLinks() {
    return this._options.inPageLinks;
  }

  get hasRibbon() {
    return !!this._ribbonEl;
  }

  get id() {
    return this._headerId;
  }

  get isSticky() {
    return this._options.sticky;
  }

  /* Private methods/getters */

  _addStickyEscaper() {
    if (!this._getStickyEscaperEl()) {
      const espacerElement = document.createElement('div');
      espacerElement.classList.add(this._headerSpacerClass);
      espacerElement.style.width = '100%';
      espacerElement.style.height = `${this._headerEl.offsetHeight}px`;

      this._headerEl.parentNode.insertBefore(espacerElement, this._headerEl);
    }
  }

  _attachClickListeners() {
    if (this._burgerButtonEl) {
      this._burgerButtonEl.addEventListener('click', this.toggleBurger);
    }
    this._navItemsEl.forEach(
      (el) => {
        // check for stopping header nav elements from closing header burger
        // for ex dropdown elements onClick should open the dropdown
        // instead of closing the burger
        if (
          this._options.navNodeFilter
          && el.dataset.activity === this._options.navNodeFilter) {
          return;
        }

        el.addEventListener('click', this.closeBurger);
      },
    );
  }

  _attachScrollListeners() {
    if (this.hasInPageLinks || this.hasRibbon || this.isSticky) {
      window.addEventListener('scroll', this._onScroll);
    }

    if (this.hasRibbon) {
      window.addEventListener('scroll', this._onScrollEnd);
    }
  }

  _getElements() {
    this._headerEl = document.getElementById(this._headerId);
    this._ribbonEl = this._headerEl.querySelector(`.${ribbonClass}`);
    this._burgerButtonEl = this._headerEl.querySelector(
      `.${burgerButtonClass}`,
    );
    this._navItemsEl = this._headerEl.querySelectorAll(`.${navItemClass}`);
  }

  _getStickyEscaperEl() {
    return document.querySelector(`.${this._headerSpacerClass}`);
  }

  _init() {
    if (this.hasInPageLinks) this._markActiveNav();

    this._headerSpacerClass = `${this._headerId}__${headerSpacerClassSuffix}`;
    this._attachClickListeners();
    this._attachScrollListeners();
  }

  _markActiveNav() {
    const offsetTop = window.innerHeight - 140;
    let activeSectionId;

    this._navItemsEl.forEach((item) => {
      const sectionId = item.getAttribute('href');
      if (sectionId.startsWith('#') && isInViewport(sectionId, offsetTop)) {
        activeSectionId = sectionId;
      }
    });


    this._navItemsEl.forEach((el) => {
      el.classList.remove(navItemActiveClass);
    });

    if (activeSectionId) {
      const linkEls = this._headerEl.querySelectorAll(
        `.header__nav-item[href='${activeSectionId}']`,
      );
      linkEls.forEach(el => el.classList.add(navItemActiveClass));
    }
  }

  _onScroll = () => {
    if (!this._scrollStartedAt) {
      this._scrollStartedAt = this._currentScrollTop;
    }

    if (this.hasInPageLinks) {
      this._markActiveNav();
    }

    if (this.isSticky) {
      this._stickHeader();
    }
  }

  _onScrollEnd = throttle(() => {
    if (this._scrollStartedAt) {
      const currentScrollTop = this._currentScrollTop;
      const scrolledAmount = Math.abs(currentScrollTop - this._scrollStartedAt);
      if (scrolledAmount > minScrollDistance) {
        if (currentScrollTop > this._scrollStartedAt) {
          this._onScrollDown(scrolledAmount);
        } else {
          this._onScrollUp(scrolledAmount);
        }
      }

      this._scrollStartedAt = false;
    }
  }, 200);

  // Hide Ribbon
  _onScrollDown() {
    this.hideRibbon();
  }

  // Show Ribbon
  _onScrollUp() {
    this.showRibbon();
  }

  _removeStickyEscaper() {
    const espacerEl = this._getStickyEscaperEl();
    if (espacerEl) {
      espacerEl.remove();
    }
  }

  _stickHeader() {
    if (this._currentScrollTop >= 150) {
      this._addStickyEscaper();
      this._headerEl.classList.add(headerStickyClass);
      this._headerEl.classList.add(headerStickyAnimationClass);
      // eslint-disable-next-line no-unused-expressions
      window.additionalScrollDownCallback && window
        .additionalScrollDownCallback();
    } else {
      this._removeStickyEscaper();
      this._headerEl.classList.remove(headerStickyClass);
      this._headerEl.classList.remove(headerStickyAnimationClass);
      // eslint-disable-next-line no-unused-expressions
      window.additionalScrollUpCallback && window
        .additionalScrollUpCallback();
    }
  }

  get _currentScrollTop() {
    return (
      window.pageYOffset
      || this._scrollEl.scrollTop
    );
  }
}

export default Header;
