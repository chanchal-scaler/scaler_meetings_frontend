
import { apiRequest, generateJWT } from '@common/api/utils';
import CaseUtil from '@common/lib/caseUtil';
import {
  getAttribution,
  setAttribution,
} from '@common/vanilla_ui/tracking/attribution';
import { INTENTS } from '@common/vanilla_ui/tracking/constants';

import Toastify from 'toastify-js';


const DEFAULT_ERROR_MESSAGE = 'Free Live class cannot be booked right'
  + ' now. Please try later';
const ELIGIBLE_PROGRAMS = ['academy', 'data_science'];

const liveClassSlotBtnClass = '.book-live-class-slot__container';
const liveClassSubmitBtnClass = '.upcoming-classes__submit-cta';
const bookedClassInfoContainerClass = '.booked-live-class__card-body';
const liveClassTimingsSelector = '.upcoming-classes__time';

const bookedClassInfoContainer = document.querySelector(
  bookedClassInfoContainerClass,
);

let selectedEventId = '';
let selectedIndex = 0;

const getRegistrationAttributions = () => {
  setAttribution(INTENTS.BOOK_LIVE_CLASS);
  return getAttribution();
};

const registerEvent = (id, token, refererURL) => apiRequest(
  'POST',
  `/api/v3/events/${id}/registration`,
  {
    attributions: getRegistrationAttributions(),
  },
  {
    headers: {
      'X-user-token': token,
      'X-REFERER': refererURL,
    },
  },
);

const makeAllSlotBtnsInactive = (bookLiveClassSlotBtns) => {
  bookLiveClassSlotBtns?.forEach((slotButton) => {
    slotButton.classList.remove('active');
  });
};

const intializeSlotButtons = (bookLiveClassSlotBtns, timingEl) => {
  bookLiveClassSlotBtns?.forEach((slotButton, index) => {
    slotButton.addEventListener('click', () => {
      makeAllSlotBtnsInactive(bookLiveClassSlotBtns);
      slotButton.classList.add('active');
      selectedEventId = slotButton.getAttribute(
        'data-class-id',
      );
      selectedIndex = index;

      // eslint-disable-next-line no-param-reassign
      timingEl.innerHTML = slotButton.getAttribute('data-attribute-timings');
    });

    if (index === 0) {
      slotButton.click();
    }
  });
};

const handleLiveClassBtnClick = async (bookClassBtn, onLiveClassBooked) => {
  bookClassBtn.classList.add('disabled');

  const token = await generateJWT();
  const currentURL = window.location.href;
  const refererURL = `${currentURL}?flc_flexi_index=${selectedIndex}`;

  window.GTMtracker?.pushEvent({
    event: 'gtm_custom_click',
    data: {
      click_text: `book-live-class-slot-${selectedIndex}`,
      click_type: `cta`,
      click_section: 'banner_section',
      click_url: '',
    },
  });

  try {
    await registerEvent(selectedEventId, token, refererURL);
    const bookedSlot = bookedClassInfoContainer.querySelector(
      `[data-class-id="${selectedEventId}"]`,
    );
    bookedSlot.classList.remove('hidden');
    onLiveClassBooked();
  } catch (error) {
    Toastify({
      text: DEFAULT_ERROR_MESSAGE,
      className: 'danger',
    });
  }
};

const initializeSubmitButton = (onLiveClassBooked, bookClassBtn) => {
  bookClassBtn.addEventListener('click', () => handleLiveClassBtnClick(
    bookClassBtn,
    onLiveClassBooked,
  ));
};

const checkEligibility = (program) => {
  const formettedProgram = CaseUtil.toCase('snakeCase', program)?.toUpperCase();
  const key = `__${formettedProgram}_CLASS_COUNT__`;
  const eligibleForBookLiveClassSlot = parseInt(window[key], 10) > 1;
  const experimentEnabled = window.__BOOK_LIVE_CLASS_SLOT__ === 'true';

  return eligibleForBookLiveClassSlot && experimentEnabled;
};

const setBookLiveClassElements = (onLiveClassBooked, program) => {
  const bookLiveClassWidget = document.querySelector(
    `[data-program-attribute="${program}"]`,
  );
  bookLiveClassWidget.classList.remove('hidden');
  selectedEventId = bookLiveClassWidget.getAttribute('data-recent-class-id');
  const slotButtons = bookLiveClassWidget.querySelectorAll(
    liveClassSlotBtnClass,
  );
  const bookClassBtn = bookLiveClassWidget.querySelector(
    liveClassSubmitBtnClass,
  );
  const timingEl = bookLiveClassWidget.querySelector(liveClassTimingsSelector);

  intializeSlotButtons(slotButtons, timingEl);
  initializeSubmitButton(onLiveClassBooked, bookClassBtn);
};

const initializeBookLiveClassWidget = (
  program,
  parentElement,
  mode,
  bookLiveClassFallback,
) => {
  const fpProgram = ELIGIBLE_PROGRAMS.includes(program) ? program : 'academy';
  if (checkEligibility(fpProgram)) {
    setBookLiveClassElements(
      () => {
        parentElement.emit('live-class-booked');
        parentElement.switchMode(mode);
      },
      fpProgram,
    );
    return;
  }

  if (bookLiveClassFallback) bookLiveClassFallback();
};

const redirectToFreeProduct = (program) => {
  window.location.replace(`/${program}/free-live-class`);
};

const countDown = (program, onForceRedirection) => {
  const countdownTimerEl = document.querySelector(
    `.booked-live-class__count-down`,
  );

  let timerValue = 4;
  const countdownInterval = setInterval(() => {
    if (timerValue === 1) {
      clearInterval(countdownInterval);
      if (onForceRedirection) {
        window.GTMtracker?.pushEvent({
          event: 'gtm_custom_click',
          data: {
            click_text: 'book-live-class-cpe-redirection',
          },
        });
        onForceRedirection();
      } else {
        window.GTMtracker?.pushEvent({
          event: 'gtm_custom_click',
          data: {
            click_text: 'free-product-redirection',
          },
        });
        redirectToFreeProduct(program);
      }
    } else {
      timerValue -= 1;
      countdownTimerEl.textContent = timerValue;
    }
  }, 1000);
};

const initializeBookedLiveClassWidget = (
  program, parentElement, onLiveClassBooked, onForceRedirection,
) => {
  parentElement.on(
    'live-class-booked',
    () => {
      countDown(program, onForceRedirection);
      onLiveClassBooked?.();
    },
  );
};


export default {
  initializeBookLiveClassWidget,
  initializeBookedLiveClassWidget,
  checkEligibility,
};
