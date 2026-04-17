// Strips the string input of all 4 bytes utf-8
// characters and only allow 3 bytes utf-8 characters.
// This ensures compatibility with our existing mysql client.
export function toUtfGeneralCi(input) {
  const regularExp = /[\u{10000}-\u{10FFFF}]/gu;

  if (typeof input !== typeof '') {
    return input;
  }
  return input.replace(regularExp, '');
}
