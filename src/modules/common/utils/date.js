import isNumber from 'lodash/isNumber';
/**
 * Legend:
 * YY - Year with only last 2 number
 * YYYY - Full year
 * MMM - Month with starting 3 letters
 * DD - Date
 * HH - Hours in 12 hour format without `0` padded
 * mm - Minutes with `0` padded
 * SS - Seconds with `0` padded
 *
 * All functions return time in 12 hour format
 */

const days = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
];

const monthFullNames = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
  'Sep', 'Oct', 'Nov', 'Dec',
];

export const DAY_FULL_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;
export const ONE_WEEK = 7 * ONE_DAY;
export const ONE_MONTH = 30 * ONE_DAY;

export function toStartOfDay(d) {
  const date = new Date(d);

  date.setMilliseconds(0);
  date.setSeconds(0);
  date.setMinutes(0);
  date.setHours(0);

  return date;
}

/**
 * Returns the first day of the week for a given date
 *
 * @export
 * @param {Date} target available date
 * @param {Boolean} [useMonday=true] uses monday as the week start day
 * @param {Boolean} [retainTime=false] retains the time in the given date
 */
export function toStartOfWeek(target, useMonday = true, retainTime = false) {
  const d = new Date(target); // Make sure d is valid
  const weekDay = d.getDay(); // Returns day of the week, 0 => Sunday
  let diff = d.getDate() - weekDay;

  // If first day is monday then adjust when current day is sunday
  if (useMonday) {
    diff += (!weekDay ? -6 : 1);
  }

  const startDate = d.setDate(diff);

  return new Date(retainTime ? startDate : toStartOfDay(startDate));
}

/**
 * Returns the first date of the year for a given date
 *
 * @export
 * @param {Date|ISODateString|integer} d Input date
 */
export function toStartOfYear(d) {
  const date = new Date(d);

  date.setMilliseconds(0);
  date.setSeconds(0);
  date.setMinutes(0);
  date.setHours(0);
  date.setDate(1);
  date.setMonth(0);

  return date;
}

/**
 * Returns `d1 - d2` dates difference. Can be negative as well (if d2 > d1)
 * @param {Date|ISODateString|integer} d1
 * @param {Date|ISODateString|integer} d2
 */
export function getDaysDifference(d1, d2) {
  const date1 = toStartOfDay(d1);
  const date2 = toStartOfDay(d2);

  const diffInMs = date1.getTime() - date2.getTime();

  // Should not use `Math.ceil` here as below cases will fail.
  // We should return -1 if evaluated value is -1.3
  return parseInt(diffInMs / (24 * 60 * 60 * 1000), 10);
}

export function getHourDifference(d1, d2) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);

  const diffInMs = date1.getTime() - date2.getTime();

  // Should not use `Math.ceil` here as below cases will fail.
  // We should return -1 if evaluated value is -1.3
  return parseInt(diffInMs / (60 * 60 * 1000), 10);
}

export function getMinutesDifference(d1, d2) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);

  const diffInMs = date1.getTime() - date2.getTime();
  return parseInt(diffInMs / (60 * 1000), 10);
}

export function getMinutesDifferenceToNow(d1) {
  const date1 = new Date();
  const date2 = new Date(d1);

  return getMinutesDifference(date1, date2);
}

export function getMinutesDifferenceFromNow(d1) {
  const date1 = new Date(d1);
  const date2 = new Date();

  const diffInMs = date1.getTime() - date2.getTime();
  return parseInt(diffInMs / (60000), 10);
}

/**
 * Returns (`d1 - d2`) months difference. Can be negative as well (if d2 > d1)
 * @param {Date|ISODateString|integer} d1
 * @param {Date|ISODateString|integer} d2
 */
export function getMonthsDifference(d1, d2) {
  const date1 = toStartOfDay(d1);
  const date2 = toStartOfDay(d2);

  const daysDiff = getDaysDifference(date1, date2);
  return parseInt((daysDiff / 30), 10);
}

export function isSameDay(d1, d2) {
  return getDaysDifference(d1, d2) === 0;
}

/**
 * Returns if given two dates are in same week or not
 *
 * @export
 * @param {*} d1 First available date
 * @param {*} d2 Second available date
 * @param {boolean} [useMonday=true] uses monday as the week start day
 * @returns {boolean} Whether given dates are in same week or not
 */
export function isSameWeek(d1, d2, useMonday = true) {
  const weekStartTime = (date) => toStartOfWeek(date, useMonday).getTime();

  return weekStartTime(d1) === weekStartTime(d2);
}

export function isSameYear(d1, d2) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);

  return date1.getFullYear() === date2.getFullYear();
}

export function isSameMonth(d1, d2) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);

  return (date1.getMonth() === date2.getMonth() && isSameYear(d1, d2));
}

export function toHHmm(date) {
  const d = new Date(date);
  let hours = d.getHours();
  const meridian = hours >= 12 ? 'PM' : 'AM';
  hours = (hours % 12) || 12;
  const minutes = `${d.getMinutes()}`;

  return `${hours}:${minutes.padStart(2, '0')} ${meridian}`;
}

export function getOrdinal(dayNumber) {
  const suffix = (dayNumber >= 4 && dayNumber <= 20)
    || (dayNumber >= 24 && dayNumber <= 30)
    ? 'th'
    : ['st', 'nd', 'rd'][(dayNumber % 10) - 1];

  return suffix;
}

export function toDDMMM(date, { humanFriendly, fullMonth, withOrdinal } = {}) {
  const d = new Date(date);

  if (humanFriendly) {
    const daysDifference = getDaysDifference(Date.now(), d);
    /* istanbul ignore next */
    if (daysDifference === 0) {
      return 'Today';
    } else if (daysDifference === 1) {
      return 'Yesterday';
    } else {
      // Do nothing
    }
  }

  const day = d.getDate();
  const month = d.getMonth();
  const ordinal = withOrdinal ? getOrdinal(day) : '';

  return `${day}${ordinal} `
    + `${fullMonth ? monthFullNames[month] : months[month]}`;
}

export function toWeekDay(date) {
  const d = new Date(date);

  return days[d.getDay()];
}

export function getDayFullName(date) {
  const d = new Date(date);

  return DAY_FULL_NAMES[d.getDay()];
}

export function humanizeDate(d) {
  const date = new Date(d);

  if (isSameDay(date, Date.now())) {
    return toHHmm(date);
  } else {
    return toDDMMM(date, { humanFriendly: true });
  }
}

export function humanizeDateTime(d) {
  const date = new Date(d);
  const dateString = toDDMMM(date, { humanFriendly: true });
  const timeString = toHHmm(date);

  return `${dateString}, ${timeString}`;
}

export function humanizeTime(seconds) {
  let interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return `${interval} years`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} months`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} days`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} hours`;
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} minutes`;
  }
  interval = Math.floor(seconds);
  return `${Math.max(2, interval)} seconds`;
}

export function toDatePickerFormat(d) {
  const date = new Date(d);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  const dateString = [year, month, day].join('-');
  const timeString = [hours, minutes].join(':');

  return `${dateString}T${timeString}`;
}

export function toDateOnlyPickerFormat(d) {
  const date = new Date(d);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  const dateString = [year, month, day].join('-');

  return `${dateString}`;
}

export function toDDMMYYYY(d, separator = '-') {
  const date = new Date(d);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const dateString = [year, month, day].join(separator);

  return dateString;
}

export function toDDMMMYYYY(date, { fullMonth } = {}) {
  const d = new Date(date);
  const year = d.getFullYear();
  return `${toDDMMM(d, { fullMonth })} ${year}`;
}

export function toMMMYYYY(date = new Date()) {
  const d = new Date(date);
  const month = d.getMonth();
  const year = d.getFullYear();
  return `${months[month]} ${year}`;
}

export function toMMMYY(date = new Date()) {
  const d = new Date(date);
  const month = d.getMonth();
  const year = d.getFullYear();
  return `${months[month]} '${parseInt(year, 10) % 100}`;
}

export function toDayDate(date) {
  const d = new Date(date);
  return `${toWeekDay(d)}, ${toDDMMM(d)}`;
}

export function toDayDateTime(date) {
  const d = new Date(date);
  return `${toWeekDay(d)}, ${toDDMMM(d)}, ${toHHmm(d)}`;
}

export function toDayDateYear(date) {
  const d = new Date(date);
  return `${toWeekDay(d)}, ${toDDMMMYYYY(d)}`;
}

export function toDateDayTime(date) {
  const dayString = toWeekDay(date);
  const dateString = toDDMMMYYYY(date);
  const timeString = toHHmm(date);
  return `${dateString}, ${dayString}, ${timeString} `;
}

export function toDateTime(date) {
  const dateString = toDDMMMYYYY(date);
  const timeString = toHHmm(date);
  return `${dateString}, ${timeString}`;
}

export function toTimeDate(date) {
  const dateString = toDDMMYYYY(date);
  const timeString = toHHmm(date);
  return `${timeString}, ${dateString}`;
}

export function timeSince(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  return humanizeTime(seconds);
}

// Returns an array of the following format
// [days, hours, minutes, seconds]
export function toTimeUnits(milliseconds) {
  let ms = milliseconds;
  if (ms < 0) {
    return [0, 0, 0, 0];
  } else {
    return [ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_SECOND].map((unit) => {
      const value = parseInt(ms / unit, 10);
      ms %= unit;
      return value;
    });
  }
}

export function toBrowserTimezone(datetime) {
  const isoDateTime = new Date(datetime).toISOString();
  return new Date(isoDateTime);
}

export function shiftTime(add, start = Date.now()) {
  const date = new Date(start);
  date.setDate(date.getDate() + (parseInt(add.days, 10) || 0));
  date.setHours(date.getHours() + (parseInt(add.hours, 10) || 0));
  date.setMinutes(date.getMinutes() + (parseInt(add.minutes, 10) || 0));
  date.setSeconds(date.getSeconds() + (parseInt(add.seconds, 10) || 0));
  return date;
}

export function generateTimeSeries({ minuteInterval }) {
  const startTime = toStartOfDay(new Date());
  const endTime = new Date(
    startTime.getTime() + ONE_DAY - ONE_MINUTE * minuteInterval,
  );
  const times = [startTime];
  let currentTime = startTime;
  while (currentTime < endTime) {
    currentTime = new Date(currentTime.getTime() + ONE_MINUTE * minuteInterval);
    times.push(currentTime);
  }

  return times;
}

/*
  This method parses Hour and Minute
  from the following format => "HH:MM UTC", "HH:MM" "HH:MM IST"
  and gives back a date object with that time
  in the browsers timezone
*/
export function parseDateFromHHmm(time) {
  const date = new Date();
  const t = time.split(' ')[0].split(':');
  date.setHours(t[0]);
  date.setMinutes(t[1]);

  return date;
}


export function getWeekNumInYear(d) {
  // Considers monday as start day of week
  const dowOffset = 1;

  const todayDate = toStartOfDay(d);
  const yearStartDate = toStartOfYear(todayDate);

  // Day of week in which year begins
  let startDay = yearStartDate.getDay() - dowOffset;
  startDay = (startDay >= 0 ? startDay : startDay + 7);

  const currentDayNum = getDaysDifference(todayDate, yearStartDate) + 1;
  return Math.floor((currentDayNum + startDay - 1) / 7) + 1;
}

export function getTimeIn24HourFormat(timeStr) {
  const [time, modifier] = timeStr.split(' ');
  const [hours, minutes] = time.split(':');
  let updatedHours = hours;
  if (hours === '12') {
    updatedHours = '00';
  }
  if (modifier === 'PM') {
    updatedHours = parseInt(updatedHours, 10) + 12;
  }
  return `${updatedHours}:${minutes}`;
}

/*
  Given the Date Object this function
  extracts the time and returns with
  12 hr Format
*/
export function getTimeInAMPMFormat(date) {
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

export const toDDMMYY = (d) => {
  // 28/07/22
  const date = new Date(d);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear().toString().slice(2);
  const dateString = [day, month, year].join('/');

  return dateString;
};

export const getDatesInRange = (startDate, endDate, step) => {
  // returns an array of dates  [startDate, ...,  endDate]
  const dates = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + step);
  }
  return dates;
};

/**
 * function to check if given date
 * is before today's date
 * @param {string} date
 * @returns boolean
 */
export const isDateBeforeToday = (date) => {
  const inputDate = new Date(date);
  const today = new Date();

  return inputDate < today;
};

/**
 * Parses no of months to years
 * @param {number} value = no of months
 * @returns no of years
 * @example parseYears(30) => 2
 */
export const parseYears = (value) => {
  if (isNumber(value)) {
    return parseInt(value / 12, 10);
  } else {
    return null;
  }
};

/**
 * Parses total no of months to months completed in year
 * @param {number} value = total no of months
 * @returns no of months completed in year
 * @example parseYears(31) => 7
 */
export const parseMonths = (value) => {
  if (isNumber(value)) {
    return parseInt(value % 12, 10);
  } else {
    return null;
  }
};

/**
 * Computes total no of months from years and months
 * @param {number} monthsVal = no of months selected for current year
 * @param {number} total = total no of months before computation
 * @returns total no of months
 * @example getValueOnMonthChange(6, 20) => 18
 * int(20/12) * 12 + 6 = 18
 * @example getValueOnMonthChange(9, 30) => 33
 * int(30/12) * 12 + 9 = 33
 */
export const getValueOnMonthChange = (monthsVal, total) => {
  let value = null;
  if (isNumber(monthsVal)) {
    value = parseYears(total) * 12 + monthsVal;
  }
  return value;
};


/**
 * Computes total no of months from years and months
 * @param {number} yearsVal = no of years selected
 * @param {number} total = total no of months before computation
 * @returns total no of months
 * @example getValueOnYearChange(2, 20) => 32
 * 2 * 12 + int(20%12) = 32
 * @example getValueOnYearChange(3, 30) => 42
 * 3 * 12 + int(30%12) = 42
 */
export const getValueOnYearChange = (yearsVal, total) => {
  let value = null;
  if (isNumber(yearsVal)) {
    value = yearsVal * 12 + parseMonths(total);
  }
  return value;
};

/**
 * getting tomorrow date for any passed prop date
 */
export const getMonthName = (date) => {
  const givenDate = new Date(date);
  return months[givenDate.getMonth()];
};

/**
 * getting tomorrow date for any passed prop date
 */
export const getTomorrowsDate = (input) => {
  const date = input instanceof Date ? input : new Date(input);
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  return nextDay;
};
