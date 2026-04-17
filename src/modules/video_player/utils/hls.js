// eslint-disable-next-line import/prefer-default-export
export function isHlsSource(src) {
  const [cleanedSrc] = src.split('?');
  return cleanedSrc.endsWith('.m3u8');
}
