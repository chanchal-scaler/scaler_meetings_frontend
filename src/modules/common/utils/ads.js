import CaseUtil from '@common/lib/caseUtil';
import {
  isAndroid,
} from '@common/utils/platform';
import {
  ANDROID_MWEB_PLAYSTORE_ID,
  ANDROID_MWEB_PLAYSTORE_STRIP_ID,
  CONTACT_US_TOP_NAV_ID,
  DESKTOP_PLAYSTORE_ID,
  PLAYSTORE_POPUP_CLASS,
} from '@common/utils/constants';


function isVisitOrganic() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const {
    utmMedium, utmSource,
  } = CaseUtil.toCase('camelCase', params);
  if (!(utmMedium || utmSource)) {
    return true;
  } else if (utmMedium === 'direct' && utmSource === 'none') {
    return true;
  } else if (utmMedium === 'organic_search') {
    return true;
  }

  return false;
}

function togglePopupDisplay(popup) {
  const popupElement = popup;
  if (popup) {
    popupElement.style.display = !popupElement.style.display ? 'block' : '';
  }
}

function showOnAndroid() {
  const el = document.getElementById(ANDROID_MWEB_PLAYSTORE_ID);
  const elStrip = document.getElementById(ANDROID_MWEB_PLAYSTORE_STRIP_ID);
  [el, elStrip].forEach(ele => ele?.classList.remove('hidden'));
}

function showOnDesktop() {
  const el = document.getElementById(DESKTOP_PLAYSTORE_ID);
  el?.classList.remove('hidden');
  const popup = el.querySelector(`.${PLAYSTORE_POPUP_CLASS}`);
  [el, popup].forEach(
    ele => ele?.addEventListener('hover', togglePopupDisplay),
  );
}

export function showPlayStoreLink() {
  if (isVisitOrganic()) {
    if (isAndroid()) {
      showOnAndroid();
    } else {
      showOnDesktop();
    }
  }
}

export function showContactNumber() {
  if (!isVisitOrganic() || !isAndroid()) {
    const el = document.getElementById(CONTACT_US_TOP_NAV_ID);
    el?.classList.remove('hidden');
  }
}

export function showContactNumberOnReviewPage() {
  const el = document.getElementById(CONTACT_US_TOP_NAV_ID);
  el?.classList.remove('hidden');
}
