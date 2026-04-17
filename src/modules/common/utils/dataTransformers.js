export function timeRangeToArray(range) {
  const intervals = [];

  for (let i = 0; i < range.length; i += 1) {
    intervals.push({
      start: range.start(i),
      end: range.end(i),
    });
  }

  return intervals;
}

/**
 * Converts `TimeRanges` object to the below format
 * [[start, end], [start, end]]
 * @param {TimeRanges} ranges
 * @returns {Array} Formatted intervals
 */
export function timeRangesToIntervals(ranges) {
  const intervals = [];
  const intervalsLength = ranges.length;
  for (let i = 0; i < intervalsLength; i += 1) {
    intervals.push(
      [ranges.start(i), ranges.end(i)],
    );
  }
  return intervals;
}
