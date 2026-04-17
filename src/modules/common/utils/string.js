export function abbreviate(
  string,
  connector = '',
  maxLength = Infinity,
) {
  const words = string.split(' ').filter(o => Boolean(o));
  const letters = [];

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    letters.push(word[0]);

    if (i + 1 === maxLength) {
      break;
    }
  }

  return letters.join(connector);
}

export const capitalize = (text) => (
  text.charAt(0).toUpperCase() + text.slice(1)
);

export function fromTemplate(template, values) {
  let convertedTemplate = template;
  Object.keys(values).forEach((key) => {
    convertedTemplate = convertedTemplate.replace(
      new RegExp(`{{${key}}}`, 'g'), values[key],
    );
  });
  return convertedTemplate;
}

export function insertSubstring(str, substr, position) {
  return [str.slice(0, position), substr, str.slice(position)].join('');
}

export const normalize = (text) => text?.trim()
  .toLowerCase()
  .replace(/[\s,\-_]/g, '');

// slugify(''Bruce-Wayne is_Batman'') => 'bruce-wayne-is_batman'
export const slugify = text => (
  text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
);

export const endsWithAnySuffix = (suffixesArray, string) => suffixesArray.some(
  (suffix) => string.endsWith(suffix),
);

export const abbreviateStringUptoTwo = (string) => {
  if (string.split(' ').length === 1) {
    // Single World Strings => First two letters in
    // upper case returned
    // Yahoo -> YA
    return string.substring(0, 2).toUpperCase();
  } else {
    // Multiple World Strings => First letters of forst two
    // words in upper case returned
    // Two Pointer Theorm -> TP
    return string.match(/\b(\w)/g).join('').substring(0, 2).toUpperCase();
  }
};

/**
 * Puts a space after every comma in the string.
 * @param {string} text - Input string
 * @returns {string} - Comma space separated string
 * @example commaSpaceSeparate("abc,def") => "abc, def"
 * @example commaSpaceSeparate("abc, def") => "abc, def"
 * @example commaSpaceSeparate("abc def") => "abc def"
 */
export const commaSpaceSeparate = text => text.replace(/,\s+|,/g, ', ');

/**
 * Converts HTML content to plain text by removing all HTML tags.
 *
 * @param {string} htmlString - The HTML content to be converted to plain text.
 * @returns {string} The plain text obtained by removing HTML tags from the
 * input.
 * @example
 * const htmlContent = '<p>This is <b>HTML</b> content.</p>';
 * convertHTMLtoText(htmlContent) => 'This is HTML content.'
 */
export function convertHTMLtoText(htmlString) {
  return htmlString.replace(/<[^>]+>/g, '');
}
