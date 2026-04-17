import Glider from 'glider-js';

// Modifications to check if to show navigations of the carousel or not
function showNavigations(
  parent,
  dots,
  prev,
  next,
  slidesToShow,
  slidesToShowInTablet,
) {
  // contains the slides of the carousel
  const track = document.querySelector(`.${parent} .glider-track`);
  const slidesCount = track.childElementCount;
  const prevButtonEl = document.querySelector(`.${parent} .${prev}`);
  const nextButtonEl = document.querySelector(`.${parent} .${next}`);
  const dotsEl = document.querySelector(`.${parent} #${dots}`);
  const windowWidth = window.innerWidth;

  // Hide navigation in desktop if slides to show is equal to number of slides
  if (
    (windowWidth >= 1024 && slidesCount === slidesToShow)
    || (windowWidth >= 768 && slidesCount === slidesToShowInTablet)
  ) {
    prevButtonEl.classList.add('sr-glider-button--track-fit');
    nextButtonEl.classList.add('sr-glider-button--track-fit');
    dotsEl.classList.add('glider-dots--track-fit');
  } else {
    prevButtonEl.classList.remove('sr-glider-button--track-fit');
    nextButtonEl.classList.remove('sr-glider-button--track-fit');
    dotsEl.classList.remove('glider-dots--track-fit');
  }
}

function dotsPostion(parent, prev, next) {
  const firstDotEl = document.querySelectorAll(`.${parent} .glider-dot`)[0];
  const prevButtonEl = document.querySelector(`.${parent} .${prev}`);
  const value = `${firstDotEl.offsetLeft
    - ((firstDotEl.offsetWidth / 2)
      + prevButtonEl.offsetWidth)
    - 10}px`;
  const valueTop = `${(firstDotEl.offsetTop + firstDotEl.offsetHeight / 2)
    - (prevButtonEl.offsetHeight / 2)}px`;
  document.querySelector(`.${parent} .${prev}`).style.left = value;
  document.querySelector(`.${parent} .${next}`).style.right = value;
  document.querySelector(`.${parent} .${prev}`).style.top = valueTop;
  document.querySelector(`.${parent} .${next}`).style.top = valueTop;
}


/*
  slidesToShowInDesktop: Num slides to show in Desktop ( >=1024px ),
                default is 1
  slidesToShowInTablet: Num slides to show in Desktop ( >=768px ),
                default is 1
  slidesToShowInMobile: Num slides to show in Tablet and Mobile ( <765px ),
                default is 1
  autoplayIntervalMs: Advance with scrollItem('next') every this many ms.
                Omit, 0, non-finite, or negative values disable autoplay.
*/
function initializeCarousel(
  carouselSelector,
  parent,
  dots,
  prev,
  next,
  slidesToShow,
  slidesToShowInTablet = slidesToShow,
  slidesToShowInMobile = slidesToShowInTablet,
  resize = true,
  slidesToScrollInDesktop = 1,
  slidesToScrollInTablet = slidesToScrollInDesktop,
  slidesToScrollInMobile = 1,
  autoplayIntervalMs = 0,
) {
  const carouselEl = document.querySelector(carouselSelector);
  // Don't initialize carousel if not present
  if (!carouselEl) {
    return;
  }

  const glider = new Glider(carouselEl, {
    slidesToShow: slidesToShowInMobile, // 'auto',
    slidesToScroll: slidesToScrollInMobile,
    dots: `#${dots}`,
    rewind: true,
    duration: 1,
    draggable: true,
    scrollLock: true,
    scrollLockDelay: 0,
    resizeLock: true,
    arrows: {
      prev: `.${prev}`,
      next: `.${next}`,
    },
    responsive: [
      {
        // screens greater than >= 768px
        breakpoint: 768,
        settings: {
          // Set to `auto` and provide item width to adjust to viewport
          draggable: true,
          slidesToShow: slidesToShowInTablet,
          slidesToScroll: slidesToScrollInTablet,
          duration: 1,
          scrollPropagate: true,
        },
      },
      {
        // screens greater than >= 1024px
        breakpoint: 1024,
        settings: {
          // Set to `auto` and provide item width to adjust to viewport
          slidesToShow,
          slidesToScroll: slidesToScrollInDesktop,
          duration: 1,
          scrollPropagate: true,
        },
      },
    ],
  });

  carouselEl.addEventListener('glider-refresh', () => {
    showNavigations(
      parent,
      dots,
      prev,
      next,
      slidesToShow,
      slidesToShowInTablet,
    );

    if (resize) {
      dotsPostion(parent, prev, next);
    }
  });

  carouselEl.addEventListener('glider-loaded', () => {
    showNavigations(
      parent,
      dots,
      prev,
      next,
      slidesToShow,
      slidesToShowInTablet,
    );

    if (resize) {
      dotsPostion(parent, prev, next);
    }
  });

  carouselEl.addEventListener('glider-slide-visible', (event) => {
    window.trackGaEvent(
      'carousel',
      carouselSelector,
      event.detail.slide,
    );
  });

  carouselEl.addEventListener('force-refresh-glider', () => {
    glider.refresh();
  });

  const autoplayMs = Number(autoplayIntervalMs);
  if (Number.isFinite(autoplayMs) && autoplayMs > 0) {
    let autoplayTimer = null;

    const stopAutoplay = () => {
      if (autoplayTimer !== null) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (document.hidden) return;
      autoplayTimer = window.setInterval(() => {
        glider.scrollItem('next');
      }, autoplayMs);
    };

    const pauseForHoverOrFocus = () => {
      stopAutoplay();
    };

    const resumeIfVisible = () => {
      if (document.hidden) return;
      startAutoplay();
    };

    carouselEl.addEventListener('mouseenter', pauseForHoverOrFocus);
    carouselEl.addEventListener('mouseleave', resumeIfVisible);
    carouselEl.addEventListener('focusin', pauseForHoverOrFocus);
    carouselEl.addEventListener('focusout', (e) => {
      if (!carouselEl.contains(e.relatedTarget)) {
        resumeIfVisible();
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    startAutoplay();
  }
}

export default {
  initialize: initializeCarousel,
};
