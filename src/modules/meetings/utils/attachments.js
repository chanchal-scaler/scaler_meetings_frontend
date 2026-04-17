export const getAttachmentInitUrl = (slug) => (
  `/meetings/${slug}/attachments/`
);

export const UploadStatus = {
  PENDING: 'PENDING',
  STARTED: 'STARTED',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  DELETED: 'DELETED',
};

export const ActionTypes = {
  ARCHIVE_UPLOAD: 'ln-uploaded-from-archive',
  MEETING_END_UPLOAD: 'ln-uploaded-at-meeting-end',
  QR_CODE_UPLOAD: 'ln-uploaded-using-qr-code',
  ARCHIVE_LECURE_OPENED: 'ln-archive-lecture-opened',
  ATTACHMENTS_TAB_OPENED: 'ln-attachments-tab-opened',
  ATTACHMENT_DOWNLOADED: 'ln-attachment-downloaded',
};

export const FileType = {
  SOURCE_FILE: 'SOURCE_FILE',
  PROXY_FILE: 'PROXY_FILE',
};

const CUSTOM_FILE_TYPES = {
  ipynb: 'application/x-ipynb+json',
};

export const hasAttachments = (meetingType) => (
  meetingType === 'lecture_hall' || meetingType === 'webinar'
);

export const toMB = (fileSize) => (fileSize / (1000 * 1000));

export const xmlToSvgUrl = (xmlString) => {
  const svgBlob = new Blob([xmlString], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);
  return svgUrl;
};

export const updateFileTypeIfRequired = (file) => {
  // check when fileType is not set (empty)
  if (file.type === '') {
    // updating the fileType of fileObject on the basis of file extension
    const { name: fileName } = file;
    const fileExtension = fileName.substr(fileName.lastIndexOf('.') + 1);
    // check when the fileExtension is present in CUSTOM_FILE_TYPES
    if (CUSTOM_FILE_TYPES[fileExtension]) {
      // using Blob.slice() to create a new Blob object
      // link for reference: developer.mozilla.org/en-US/docs/Web/API/Blob/slice
      const fileObject = file
        .slice(0, file.size, CUSTOM_FILE_TYPES[fileExtension]);
      fileObject.name = file.name;
      return fileObject;
    }
  }
  return file;
};
