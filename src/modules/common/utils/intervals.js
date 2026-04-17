/**
 * Returns array of merged intervals
 *
 * @param {array} intervals [[1,4], [2,5]]
 * @returns {array} merged intervals [[1,5]]
*/
export function mergeIntervals(intervals) {
  // eslint-disable-next-line no-return-assign
  const mergeInterval = (eventOne, eventTwo) => (
    !eventOne.length || eventOne[eventOne.length - 1][1] < eventTwo[0]
      ? eventOne.push(eventTwo)
      // eslint-disable-next-line no-param-reassign
      : (eventOne[eventOne.length - 1][1] = Math.max(
        eventOne[eventOne.length - 1][1],
        eventTwo[1],
      // eslint-disable-next-line no-sequences
      )),
    eventOne
  );
  return intervals
    .sort((eventOne, eventTwo) => eventOne[0] - eventTwo[0])
    .reduce(mergeInterval, []);
}

function removeDuplicates(arr) {
  const lookup = {};
  const results = [];
  arr.forEach((el) => {
    const key = el.toString();
    /* istanbul ignore next */
    if (lookup[key]) return;
    lookup[key] = 1;
    results.push(el);
  });
  return results;
}

function intervalExcludingInterval(intervalA, intervalB) {
  if (intervalA[1] < intervalB[0]) return [intervalA];
  if (intervalA[0] > intervalB[1]) return [intervalA];
  const lines = [];
  const line1 = [intervalA[0], Math.min(intervalA[1], intervalB[0])];
  if (line1[0] < line1[1]) lines.push(line1);
  const line2 = [intervalB[1], intervalA[1]];
  if (line2[0] < line2[1]) lines.push(line2);
  return lines;
}

function intervalsExcludingInterval(intervals, excludedInterval) {
  const results = [];
  intervals.forEach((interval) => {
    const lines = intervalExcludingInterval(interval, excludedInterval);
    results.push(...lines);
  });
  return results;
}

function intervalExcludingIntervals(pInterval, excludedIntervals) {
  let checking = [pInterval];
  excludedIntervals.forEach((excludedInterval) => {
    checking = intervalsExcludingInterval(checking, excludedInterval);
  });
  return removeDuplicates(checking);
}
/**
 * Returns Non Overlapping Intervals from given pairs
 *
 * @param {array} pIntervalArr [[1,4]]
 * @param {array} diffIntervalArr [[2,3]]
 * @returns {array} [[1,2], [3,4]]
*/
export function getNonOverlappingIntervals(pIntervalArr, diffIntervalArr) {
  let results = [];
  pIntervalArr.forEach((pInterval) => {
    const lines = intervalExcludingIntervals(pInterval, diffIntervalArr);
    results.push(...lines);
  });
  results = removeDuplicates(results);
  return results;
}
