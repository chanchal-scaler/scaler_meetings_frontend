/*
File to format seconds in HH:MM:SS or in different formats etc.
*/

export default function toHHMMSS(seconds) {
  const d = Number(seconds);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);

  let hDisplay = `0${h}:`;
  let mDisplay = `0${m}:`;
  let sDisplay = `0${s}`;

  hDisplay = h > 9 ? hDisplay.substring(1) : hDisplay;
  mDisplay = m > 9 ? mDisplay.substring(1) : mDisplay;
  sDisplay = s > 9 ? sDisplay.substring(1) : sDisplay;
  return hDisplay + mDisplay + sDisplay;
}

/**
 *
 * @param {Number} seconds - seconds to convert to hours
 * @returns {Number} - hours
 */
export function secondsToHours(seconds) {
  const hours = Math.floor(seconds / 3600);
  return hours;
}

/**
 *
 * @param {Number} seconds - seconds to convert to hours
 * @returns {Number} - days
 */
export function secondsToDays(seconds) {
  const days = Math.floor(secondsToHours(seconds) / 24);
  return days;
}

/**
 *
 * @param {Number} seconds - seconds to convert to hours
 * @returns {String}
 */
export function secondsToHM(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
