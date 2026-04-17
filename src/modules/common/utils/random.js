export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandomFromArray(array) {
  return array[randomInt(0, array.length - 1)];
}
