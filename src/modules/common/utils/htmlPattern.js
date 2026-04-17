export default function containsHtml(text) {
  const pattern = /<\/?[a-z][a-z0-9]*\b[^>]*>/gi;
  const htmlTags = text?.match(pattern);

  return !!htmlTags;
}
