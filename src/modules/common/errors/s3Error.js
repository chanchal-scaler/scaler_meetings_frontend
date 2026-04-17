const constructErrorMessage = (errorCode) => `S3Error::${errorCode}`;

class S3Error extends Error {
  static ATTACHMENT_INITIALIZATION_FAILED = 'ATTACHMENT_INITIALIZATION_FAILED';

  static PAPERCLIP_POSTPOLICY_FAILED = 'PAPERCLIP_POSTPOLICY_FAILED';

  static S3_UPLOAD_FAILED = 'S3_UPLOAD_FAILED';

  static FILE_UPDATION_FAILED = 'FILE_UPDATION_FAILED';

  static NETWORK_PROBLEM_DETECTED = 'NETWORK_PROBLEM_DETECTED';

  constructor(errorCode) {
    super(constructErrorMessage(errorCode));

    this.message = constructErrorMessage(errorCode);
    this.errorCode = errorCode;
  }
}

export default S3Error;
