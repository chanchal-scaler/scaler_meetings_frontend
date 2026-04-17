const units = [{
  unit: 'hour',
  length: 1,
  magnitude: 60 * 60,
  allowZero: false,
}, {
  unit: 'minute',
  length: 2,
  magnitude: 60,
  allowZero: true,
}, {
  unit: 'second',
  length: 2,
  magnitude: 1,
  allowZero: true,
}];

// Returns time passed in seconds to HH:MM:SS
// Ex: Input: 322, Output: 05:22
// eslint-disable-next-line import/prefer-default-export
export function toCountdown(duration) {
  const list = [];
  let remaining = parseInt(duration, 10);
  units.forEach(({ magnitude, length, allowZero }) => {
    const value = parseInt(remaining / magnitude, 10);
    remaining %= magnitude;
    if (list.length > 0 || allowZero || value > 0) {
      list.push(String(value).padStart(length, '0'));
    }
  });

  return list.join(':');
}
