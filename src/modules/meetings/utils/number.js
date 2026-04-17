export function isInt(n) {
  return n % 1 === 0;
}

export function isFloat(n) {
  return n % 1 !== 0;
}

export function isOddMultipleOfHalf(num) {
  return isFloat(num) && isInt(num * 2);
}

export function toPercentages(shares) {
  const total = shares.reduce((a, b) => a + b, 0);
  if (total === 0) {
    return new Array(shares.length).fill(0);
  }

  // Logic that makes sure that total percent is always 100 when rounding off
  // Cases can arise where 2 options have exaclty .5 multiple percentages
  // Ex: Consider the followinf distribution
  // Before rounding: 25, 30.5, 20.5, 24 -> Total 100%
  // After rounding: 25, 31, 21, 24 -> Total 101%
  // Below logic handles such cases
  let halfSeen = false;
  return shares.map(o => {
    const fraction = o / total;
    let value = fraction * 100;
    if (isOddMultipleOfHalf(value)) {
      if (halfSeen) {
        value -= 1;
        halfSeen = false;
      } else {
        halfSeen = true;
      }
    }

    return Math.round(value);
  });
}
