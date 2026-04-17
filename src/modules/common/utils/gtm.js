export function feedbackFormGtmEvent(values) {
  if (!values) {
    return;
  }
  let ratingGiven = 0;
  let lengthOfInput = 0;
  values.forEach((item) => {
    if (item.value) {
      if (Number.isInteger(item.value)) {
        ratingGiven = item.value;
      } else {
        lengthOfInput = item.value.length;
      }
    }
  });
  window.TrackingHelper?.track('feedbackFormFormatter', {
    ratingGiven,
    lengthOfInput,
  });
}

export function sendUserAttributeGTMEvent(
  experienceMonths, experienceYears, orgyear,
) {
  window.TrackingHelper?.track('userExtraDataFormatter', {
    cu_months_of_experience: (
      parseInt(experienceMonths, 10)
      + parseInt(experienceYears, 10) * 12
    ),
    cu_year_of_graduation: orgyear ? parseInt(orgyear, 10) : undefined,
  });
}

export function sendSubmitGTMEvent(
  eventName, data,
) {
  const { category } = data;
  const name = `${category}_${eventName}`;
  window.TrackingHelper?.track('submitFormatter', {
    name,
    ...data,
    ...(window.TrackingHelper?.getContext(category) || {}),
  });
}

export function gtmEventHandler(
  type, elementName, eventType, eventCategory, data,
) {
  const element = elementName || type;
  let tagName;
  if (type && eventCategory) {
    tagName = `${eventCategory}_${type}`;
  } else {
    tagName = type;
  }
  window.TrackingHelper?.track('eventFormatter', {
    element,
    tagName,
    category: eventCategory,
    eventType: eventType || 'click',
    ...(data || {}),
    ...(window.TrackingHelper?.getContext(eventCategory) || {}),
  });
}

export function sendModalOpenGTMEvent(element, status) {
  window.TrackingHelper?.track('modalChangeFormatter', {
    element,
    status,
  });
}
