/* eslint-disable class-methods-use-this */
import { apiRequest } from '@common/api/utils';
import { S3Error } from '@common/errors';

const defaultConfig = {
  bucket: window.__S3_CONFIG__?.bucket,
  region: window.__S3_CONFIG__?.region,
};

class S3Util {
  constructor(config = defaultConfig) {
    this.bucket = config.bucket;
    this.region = config.region;
  }

  async updateAttachment(
    attachment, attachmentId, extraParams = {},
  ) {
    const _attachment = new File(
      [attachment],
      this._s3FriendlyKey(attachment.name),
      { type: attachment.type },
    );

    const ownerId = attachmentId;
    const signedS3Post = await this._getAttachmentPostPolicy(
      ownerId, _attachment, extraParams,
    );
    const formData = this._populateAttachmentFormData(
      signedS3Post, _attachment,
    );
    const uploadStatus = await this._uploadToS3(formData);
    if (uploadStatus) {
      // eslint-disable-next-line no-unused-vars
      const { url } = await this._updateAttachmentData({
        attachmentId: ownerId,
        fileName: _attachment.name,
        fileSize: _attachment.size,
        fileType: _attachment.type,
        lastModified: String(new Date(_attachment.lastModified)),
      }, extraParams);

      return { success: true, ownerId };
    } else {
      throw new S3Error(S3Error.S3_UPLOAD_FAILED);
    }
  }

  // Send a file in attachment
  async uploadAttachment(initializationUrl, attachment, extraParams = {},
    options = {}) {
    const _attachment = new File(
      [attachment],
      this._s3FriendlyKey(attachment.name),
      { type: attachment.type },
    );

    const uploadParams = {
      attachment_name: _attachment.name,
      attachment_type: _attachment.type,
    };

    const ownerId = await this._initializeAttachment(
      initializationUrl, { ...uploadParams, ...extraParams }, options,
    );
    const signedS3Post = await this._getAttachmentPostPolicy(
      ownerId, _attachment, extraParams, options,
    );

    const formData = this._populateAttachmentFormData(
      signedS3Post, _attachment, options,
    );
    const uploadStatus = await this._uploadToS3(formData);

    if (uploadStatus) {
      const { url } = await this._updateAttachmentData({
        attachmentId: ownerId,
        fileName: _attachment.name,
        fileSize: _attachment.size,
        fileType: _attachment.type,
        lastModified: String(new Date(_attachment.lastModified)),
      }, extraParams);

      return { success: true, ownerId, url };
    } else {
      throw new S3Error(S3Error.S3_UPLOAD_FAILED);
    }
  }

  _createBucketUrl() {
    return `https://${this.bucket}.s3.amazonaws.com/`;
  }

  async _initializeAttachment(initializationUrl, uploadParams, options) {
    try {
      const resp = await apiRequest('POST', initializationUrl, uploadParams,
        options);
      return resp.owner_id;
    } catch (error) {
      throw this._error(error, S3Error.ATTACHMENT_INITIALIZATION_FAILED);
    }
  }

  async _getAttachmentPostPolicy(ownerId, attachment, extraParams = {},
    options) {
    const ppdParams = {
      owner_id: ownerId,
      owner_attribute: 'attachment',
      owner_name: 'Attachment',
      bucket: this.bucket,
      region: this.region,
      filename: attachment.name,
      filetype: attachment.type,
      filesize: attachment.size,
    };

    const ppdUrl = '/paperclip-ppd';
    try {
      const response = await apiRequest(
        'POST', ppdUrl, { ...ppdParams, ...extraParams },
        options,
      );
      if (response.success) {
        return response.signed_s3_post;
      } else {
        throw new this._controllerError(response.error);
      }
    } catch (error) {
      throw this._error(error, S3Error.PAPERCLIP_POSTPOLICY_FAILED);
    }
  }

  _createUploadForm(signedS3Post) {
    const formData = new FormData();
    const {
      key, acl, access_key: accessKey, policy, signature,
    } = signedS3Post;
    formData.append('key', key);
    formData.append('acl', acl);
    formData.append('AWSAccessKeyId', accessKey);
    formData.append('policy', policy);
    formData.append('signature', signature);
    return formData;
  }

  _populateAttachmentFormData(signedS3Post, attachment) {
    const uploadForm = this._createUploadForm(signedS3Post);
    uploadForm.append('Content-Type', attachment.type);
    uploadForm.append('file', attachment);
    return uploadForm;
  }

  async _uploadToS3(formData) {
    const bucketUrl = this._createBucketUrl();
    try {
      const resp = await fetch(bucketUrl, {
        method: 'POST',
        mode: 'cors',
        body: formData,
        cache: 'no-cache',
      });
      return resp.ok;
    } catch (error) {
      throw this._error(error, S3Error.S3_UPLOAD_FAILED);
    }
  }

  async _updateAttachmentData(params, extraParams, options) {
    const updateUrl = '/update-attachment';
    try {
      return await apiRequest('POST', updateUrl, {
        ...{
          attachment_id: params.attachmentId,
          filename: params.fileName,
          filesize: params.fileSize,
          filetype: params.fileType,
          last_modified: params.lastModified,
        },
        ...extraParams,
      }, options);
    } catch (error) {
      throw this._error(error, S3Error.FILE_UPDATION_FAILED);
    }
  }

  // Is thrown when the error is from rails server side.
  // These errors should be handled on your rails route only.
  _controllerError(msg) {
    const err = new Error(msg);
    err.isFromController = true;
    return err;
  }

  _error(error, errorCode) {
    if (error.isFromServer) {
      // s3 related errors
      return new S3Error(errorCode);
    } else if (error.isFromController) {
      return new Error(error.message);
    }
    return new S3Error(S3Error.NETWORK_PROBLEM_DETECTED);
  }

  _s3FriendlyKey(text, delimiter = '_') {
    return text.replace(/[^a-zA-Z0-9.]/g, delimiter);
  }
}

export default S3Util;
