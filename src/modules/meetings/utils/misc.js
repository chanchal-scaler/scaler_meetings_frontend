const MULTIPLIER = 2;

export function encodeId(id) {
  const digits = String(id).split('');
  const len = digits.length;
  const half = parseInt(len / 2, 10);
  for (let i = 0; i < half; i += 1) {
    digits[i] = String((
      parseInt(digits[i], 10)
      + parseInt(digits[len - i - 1], 10)
    ) % 10);
  }

  return digits.reverse()
    .map((c, i) => String
      .fromCharCode(97 + parseInt(c, 10) + (MULTIPLIER * (i + 1))))
    .join('');
}

export function decodeId(encodedId) {
  const digits = [];
  encodedId.split('').forEach((c, i) => {
    const num = c.charCodeAt(0) - (97 + MULTIPLIER * (i + 1));
    digits.unshift(num);
  });

  const len = digits.length;
  const half = parseInt(len / 2, 10);
  for (let i = 0; i < half; i += 1) {
    digits[i] -= digits[len - i - 1];
    if (digits[i] < 0) {
      digits[i] += 10;
    }
  }

  return digits.join('');
}

export function combineIntervals(intervals) {
  let duration = 0;

  if (intervals.length > 1) {
    duration = intervals[intervals.length - 1].time - intervals[0].time;
  } else if (intervals.length === 1) {
    duration = intervals[0].time;
  }

  return duration;
}
