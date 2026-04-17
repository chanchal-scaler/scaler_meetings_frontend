export const xmlToSvgUrl = (xmlString) => {
  const svgBlob = new Blob([xmlString], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);
  return svgUrl;
};
