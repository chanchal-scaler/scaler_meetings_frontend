export default function containsLink(text) {
  // eslint-disable-next-line max-len
  const urlPattern = /(https?:\/\/)?([a-zA-Z0-9]+(\.[a-zA-Z]{2,})+)(\/[^\s]*)?/gi;
  // Remove all spaces
  const trimmedText = text?.replace(/\s/g, '');
  const urls = trimmedText?.match(urlPattern);

  return !!urls;
}
