import clamp from 'lodash/clamp';

export function normalize(
  value,
  inputRange,
  outputRange = { min: 0, max: 1 },
) {
  if (
    (inputRange.min === inputRange.max)
    || (outputRange.min === outputRange.max)
  ) {
    return outputRange.min;
  }

  const _value = clamp(value, inputRange.min, inputRange.max);
  const _baseNormalizedValue = (
    (_value - inputRange.min) / (inputRange.max - inputRange.min)
  );
  return (
    _baseNormalizedValue * (outputRange.max - outputRange.min)
    + outputRange.min
  );
}

export function calculatePercentage(numerator, denominator) {
  if (numerator === 0 || denominator === 0) {
    return 0;
  }
  return (
    (numerator / denominator) * 100
  ).toFixed(0);
}

export const abbreviateNumber = (num) => {
  if (num > 999 && num < 1000000) {
    // convert to K for number from > 1000 < 1 million
    return `${(num / 1000).toFixed(1)}K`;
  } else if (num > 1000000) {
    // convert to M for number from > 1 million
    return `${(num / 1000000).toFixed(1)}M`;
  } else {
    return num; // if value < 1000, nothing to do
  }
};

/**
 * Converts any given input to percentage value.
 */
export function safePercentage(_value, options = {}) {
  const { round = true } = options;
  const value = parseFloat(_value, 10);
  if (Number.isNaN(value)) return 0;

  let result = clamp(value, 0, 100);
  if (round) result = Math.round(result);

  return result;
}
