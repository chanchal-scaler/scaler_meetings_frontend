import { fromTemplate } from '@common/utils/string';

const ARROWS = {
  previous: {
    vertical: 'icon-chevron-up',
    horizontal: 'icon-chevron-left',
  },
  next: {
    vertical: 'icon-chevron-down',
    horizontal: 'icon-chevron-right',
  },
};

/**
 * All available options for `Scroller`
 */
const defaultOptions = {
  // Scroll direction
  direction: 'horizontal',
  // By what amount the arrow keys will scroll the container
  step: 30,
  // Amount of scroll in the respective direction after which arrow key will
  // become visible
  arrowOffset: 30,
  hasScrollBar: false,
};

class Scroller {
  static ARROW_ICON_MARKUP = `<i class="{{icon}}"></i>`;

  static BASE_CLASS = 'scroller';

  constructor(selector, options = {}) {
    this._containerEl = document.querySelector(selector);
    this._finalOptions = { ...defaultOptions, ...options };

    if (this.containerEl) {
      this._scrollEl = this.containerEl.querySelector('.scroller__items');
      this._arrowContainerEl = this.containerEl.querySelector(
        '.scroller__arrows',
      );
      this._initialized = true;
      this._addArrowsToDOM();
      this._addScrollListener();
      this.evaluate();
    } else {
      this._initialized = true;
      // eslint-disable-next-line
      console.error('Couldn\'t find element passed to Scroller in DOM');
    }
  }

  /* Public Methods */

  currentScrollOffset() {
    if (this.isHorizontal) {
      return this.scrollEl.scrollLeft;
    } else {
      return this.scrollEl.scrollTop;
    }
  }

  dispose() {
    if (this.isInitialized) {
      this.previousArrowEl.removeEventListener('click', this._handleArrowClick);
      this.nextArrowEl.removeEventListener('click', this._handleArrowClick);
      this.scrollEl.removeEventListener('scroll', this._handleScroll);
    }
  }

  evaluate() {
    requestAnimationFrame(() => this._showOrHideArrows());
  }

  maxScrollOffset() {
    if (this.isHorizontal) {
      return this.scrollEl.scrollWidth - this.scrollEl.offsetWidth;
    } else {
      return this.scrollEl.scrollHeight - this.scrollEl.offsetHeight;
    }
  }

  isScrollable() {
    return this.maxScrollOffset() > this.arrowOffset;
  }

  /* Private Methods */

  _addArrowsToDOM() {
    this.containerEl.classList.add(
      Scroller.BASE_CLASS,
      `${Scroller.BASE_CLASS}--${this.direction}`,
      this.hasScrollBar ? '' : `${Scroller.BASE_CLASS}--no-scrollbar`,
    );

    const previousArrowEl = this._createArrow('previous');
    const nextArrowEl = this._createArrow('next');
    this._arrowEls = {
      previous: previousArrowEl,
      next: nextArrowEl,
    };
  }

  _addScrollListener() {
    this.scrollEl.addEventListener('scroll', this._handleScroll);
  }

  _createArrow(type) {
    const arrowIcon = ARROWS[type][this.direction];
    const arrowButtonEl = document.createElement('a');

    // Store the arrow type in element
    arrowButtonEl.setAttribute('data-type', type);
    arrowButtonEl.innerHTML = fromTemplate(Scroller.ARROW_ICON_MARKUP, {
      icon: arrowIcon,
    });

    arrowButtonEl.classList.add(
      `${Scroller.BASE_CLASS}__arrow`,
      `${Scroller.BASE_CLASS}__arrow--${type}`,
      'hidden', // Hide arrow by default
    );
    arrowButtonEl.addEventListener('click', this._handleArrowClick);

    this.arrowContainerEl.append(arrowButtonEl);
    return arrowButtonEl;
  }

  _handleArrowClick = (event) => {
    const target = event.currentTarget;
    const type = target.getAttribute('data-type');
    const scrollMagnitude = (type === 'previous' ? -1 : 1) * this.step;
    const newScrollOffset = this.currentScrollOffset() + scrollMagnitude;
    this.scrollEl.scrollTo({
      top: this.isHorizontal ? 0 : newScrollOffset,
      left: this.isHorizontal ? newScrollOffset : 0,
      behavior: 'smooth',
    });
  }

  _handleScroll = () => {
    this._showOrHideArrows();
  }

  _shouldShowArrow(type) {
    if (this.isScrollable()) {
      let scrollOffset = this.currentScrollOffset();

      // Reverse the scrollOffset value
      if (type === 'next') {
        scrollOffset = this.maxScrollOffset() - scrollOffset;
      }

      return scrollOffset > this.arrowOffset;
    } else {
      return false;
    }
  }

  _showOrHideArrows() {
    this._toggleArrowVisibility('previous');
    this._toggleArrowVisibility('next');
  }

  _toggleArrowVisibility(type) {
    const arrowEl = this[`${type}ArrowEl`];
    if (this._shouldShowArrow(type)) {
      arrowEl.classList.remove('hidden');
    } else {
      arrowEl.classList.add('hidden');
    }
  }

  /* Public Getters */

  get arrowContainerEl() {
    return this._arrowContainerEl;
  }

  get arrowOffset() {
    return this.options.arrowOffset;
  }

  get containerEl() {
    return this._containerEl;
  }

  get direction() {
    return this.options.direction;
  }

  get hasScrollBar() {
    return this.options.hasScrollBar;
  }

  get isHorizontal() {
    return this.direction === 'horizontal';
  }

  get isInitialized() {
    return this._initialized;
  }

  get options() {
    return this._finalOptions;
  }

  get previousArrowEl() {
    return this._arrowEls.previous;
  }

  get nextArrowEl() {
    return this._arrowEls.next;
  }

  get scrollEl() {
    return this._scrollEl;
  }

  get step() {
    return this.options.step;
  }
}

export default Scroller;
