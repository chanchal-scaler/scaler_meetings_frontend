const category = 'drona';

export function setMeetingContext(meetingSlug) {
  window.TrackingHelper?.setContext('drona', {
    meetingSlug,
  });
}

export function clearMeetingContext() {
  window.TrackingHelper?.clearContext('drona');
}

export function addBookmarkGTMEvent(
  meetingSlug, bookmarkInputLength, status, message = 'success',
) {
  window.TrackingHelper?.track('meetingBookmarkFormatter', {
    bookmarkInputLength,
    status,
    message,
    category,
    meetingSlug,
  });
}

function captureEventOnGtm(event) {
  const gtmElement = event.currentTarget;
  if (gtmElement) {
    const element = gtmElement.dataset.gtmElement;
    const elementSection = gtmElement.dataset.gtmSection;
    const elementCategory = gtmElement.dataset.gtmCategory;
    const elementName = gtmElement.dataset.gtmName;
    const elementUrl = gtmElement.dataset.gtmUrl;
    const elementResult = gtmElement.dataset.gtmResult;

    window.GTMtracker?.pushEvent({
      event: 'gtm_custom_click',
      data: {
        click_text: elementName,
        click_element: element,
        click_type: elementCategory,
        click_section: elementSection,
        click_url: elementUrl,
        click_result: elementResult,
      },
    });
  }
  event.stopPropagation();
}

export function attachDronaEventListeners() {
  const gtmElements = document.getElementsByClassName(
    'drona-gtm-track-element',
  );
  [...gtmElements].forEach(gtmElement => {
    const mixPanelTrackingAllowed = gtmElement.getAttribute(
      'data-gtm-tracking-allowed',
    );
    if (mixPanelTrackingAllowed || mixPanelTrackingAllowed === 'true') {
      gtmElement.removeEventListener('click', captureEventOnGtm);
      gtmElement.addEventListener('click', captureEventOnGtm, true);
    }
  });
}
