// eslint-disable-next-line import/prefer-default-export
export function transformDistribution(choices, distribution) {
  return choices.reduce((a, choice) => {
    let value = distribution[choice];
    if (value) {
      value = parseInt(value, 10);
    } else {
      value = 0;
    }
    a.push(value);
    return a;
  }, []);
}
