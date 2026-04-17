import { normalize } from './string';

function _createMatchFn(quoteChar = '"', delimiter = ',') {
  const regex = new RegExp(
    `\\s*(${quoteChar})?(.*?)\\1\\s*(?:${delimiter}|$)`,
    'gs',
  );
  return str => [...str.matchAll(regex)].map(m => m[2])
    .filter((_, i, a) => i < a.length - 1); // cut off blank match at end
}

// Below code taken from https://stackoverflow.com/a/59219146
/**
 * Takes a raw CSV string and converts it to a JavaScript object.
 * @param {string} string The raw CSV string.
 * @param {string[]} headers An optional array of headers to use. If none are
 * given, they are pulled from the file.
 * @param {string} quoteChar A character to use as the encapsulating character.
 * @param {string} delimiter A character to use between columns.
 * @returns {object[]} An array of JavaScript objects containing headers as keys
 * and row entries as values.
 */
export function csvToJson(string, {
  quoteChar, delimiter, normalizeHeaders,
}) {
  const match = _createMatchFn(quoteChar, delimiter);

  const lines = string.split('\n');
  let heads = match(lines.splice(0, 1)[0]);
  if (normalizeHeaders) heads = heads.map(t => normalize(t || ''));

  return lines.map(line => match(line).reduce((acc, cur, i) => ({
    ...acc,
    [heads[i] || `extra_${i}`]: (cur.length > 0) ? (Number(cur) || cur) : null,
  }), {}));
}

export function getCsvHeaders(string, {
  quoteChar, delimiter, normalizeHeaders,
}) {
  const match = _createMatchFn(quoteChar, delimiter);

  const lines = string.split('\n');
  let heads = match(lines.splice(0, 1)[0]);
  if (normalizeHeaders) heads = heads.map(t => normalize(t || ''));

  return heads;
}

export function parseCsvToRowsAndColumn(csvText, csvColumnDelimiter = '\t') {
  const rows = csvText.split('\n');
  if (!rows || rows.length === 0) {
    return [];
  }

  return rows.map(row => row.split(csvColumnDelimiter));
}
