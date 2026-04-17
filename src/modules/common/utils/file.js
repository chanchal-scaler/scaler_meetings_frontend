/* eslint-disable no-use-before-define */
const fileTypeIconMap = {
  document: 'file-document',
  audio: 'file-audio',
  video: 'file-video',
  pdf: 'file-pdf',
  image: 'image',
  compressed: 'file-compressed',
  code: 'file-code',
  file: 'file',
  docx: 'file-document',
  py: 'file-code',
  ipynb: 'file-code',
};

const fileLabelMap = {
  document: 'Document',
  audio: 'Audio',
  video: 'Video',
  pdf: 'PDF',
  image: 'Image',
  compressed: 'Compressed file',
  code: 'Code',
  file: 'File',
  docx: 'Document',
  py: 'Python source code',
  ipynb: 'Jupyter notebook',
};

export function downloadFileFromLink(link, filename) {
  const element = document.createElement('a');
  element.setAttribute('href', link);
  element.setAttribute('target', '_blank');
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  document.body.removeChild(element);
  return element;
}

export const readFileContent = (file, readerType = 'readAsText') => new Promise(
  (resolve, reject) => {
    const validreaderType = ['readAsText', 'readAsDataURL',
      'readAsBinaryString', 'readAsArrayBuffer'];

    if (!validreaderType.includes(readerType)) {
      reject(new TypeError('Invalid Reader type '));
    }

    const fileReader = new FileReader();
    fileReader.onload = ((event) => resolve(event.target.result));
    fileReader.onerro = ((error) => reject(error));
    fileReader[readerType](file);
  },
);

export function getIconFromMime(mime) {
  const type = getTypeFromMime(mime);
  return fileTypeIconMap[type];
}

export function getLabelFromMime(mime) {
  const type = getTypeFromMime(mime);
  return fileLabelMap[type];
}

export function getTypeFromMime(mime) {
  /* istanbul ignore next */
  switch (mime) {
    // eslint-disable-next-line max-len
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return 'document';
    case 'application/pdf':
      return 'pdf';
    case 'audio/aac':
    case 'audio/mpeg':
    case 'audio/3gpp':
    case 'audio/3gpp2':
    case 'audio/wav':
    case 'audio/webm':
      return 'audio';
    case 'video/mpeg':
    case 'video/quicktime':
    case 'video/x-msvideo':
    case 'video/webm':
    case 'video/3gpp':
    case 'video/3gpp2':
      return 'video';
    case 'image/png':
    case 'image/jpeg':
    case 'image/svg+xml':
    case 'image/gif':
    case 'image/webp':
    case 'image/bmp':
    case 'image/tiff':
    case 'image/x-icon':
    case 'image/vnd.microsoft.icon':
      return 'image';
    case 'application/x-gtar':
    case 'application/x-gzip':
    case 'application/x-tar':
    case 'application/zip':
    case 'application/x-rar-compressed':
      return 'compressed';
    case 'application/javascript':
    case 'application/json':
    case 'text/html':
    case 'text/css':
    case 'text/x-python-script':
      return 'code';
    case 'application/x-ipynb+json':
      return 'ipynb';
    default:
      return 'file';
  }
}

export function getHumanReadableFileSize(
  bytes, useMetricUnits = true, decimalPlaces = 2,
) {
  const threshold = useMetricUnits ? 1000 : 1024;

  if (Math.abs(bytes) < threshold) {
    return `${bytes} B`;
  }

  const units = useMetricUnits
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  let index = -1;
  let convertedData = bytes;

  const faceValue = 10 ** decimalPlaces;

  do {
    convertedData /= threshold;
    index += 1;
  } while (
    Math.round(Math.abs(convertedData) * faceValue) / faceValue >= threshold
    && index < units.length - 1
  );

  return `${convertedData.toFixed(decimalPlaces)} ${units[index]}`;
}
