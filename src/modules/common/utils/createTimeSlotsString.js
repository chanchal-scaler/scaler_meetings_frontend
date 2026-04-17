/*
  Given the Date Object this function
  extracts the time and returns with
  12 hr Format
*/
function getTimeInAMPMFormat(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  hours = hours || 12; // the hour '0' should be '12'
  hours = hours < 10 ? `0${hours}` : hours;
  // appending zero in the start if hours less than 10
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minutes} ${ampm}`;
}

// eslint-disable-next-line import/prefer-default-export
export function createTimeSlotsString(initialDate, gapInSeconds = 30 * 60) {
  const startDate = new Date(initialDate);
  const gapInMS = gapInSeconds * 1000;
  const endDate = new Date(startDate.getTime() + gapInMS);

  const startDateStr = getTimeInAMPMFormat(startDate);
  const endDateStr = getTimeInAMPMFormat(endDate);

  return `${startDateStr} - ${endDateStr}`;
}
