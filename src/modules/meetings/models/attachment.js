import {
  action, flow, makeObservable, observable,
} from 'mobx';

import S3Util from '@common/lib/s3Util';
import { toast } from '@common/ui/general/Toast';
import attachmentsApi from '~meetings/api/attachments';
import { UploadStatus, FileType } from '~meetings/utils/attachments';

class Attachment {
  constructor(
    attachmentStore,
    file,
    fileType = FileType.SOURCE_FILE,
    status = UploadStatus.PENDING,
    attachmentId = null,
  ) {
    this.store = attachmentStore;
    this.file = file;
    this.status = status;
    this.fileType = fileType;
    this.attachmentId = attachmentId;
    this.url = file.url;

    if (this.fileType === FileType.SOURCE_FILE) {
      const { postUrl, token } = this.store;
      this._uploadToS3(postUrl, { token });
    }
    makeObservable(this, {
      store: observable,
      file: observable,
      status: observable,
      fileType: observable,
      attachmentId: observable,
      setUrl: action.bound,
      setStatus: action.bound,
      retry: action.bound,
      delete: action.bound,
      url: observable,
      _uploadToS3: action.bound,
    });
  }

  setStatus(status) {
    this.status = status;
  }

  setUrl(url) {
    this.url = url;
  }

  retry() {
    if (
      this.status === UploadStatus.FAILURE
      && this.fileType === FileType.SOURCE_FILE
    ) {
      const { postUrl, token } = this.store;
      this._uploadToS3(postUrl, { token });
    }
  }

  delete = flow(function* (skipApiCall = false) {
    const { token, meetingSlug } = this.store;
    const currentStatus = this.status;

    if (skipApiCall) {
      this.setStatus(UploadStatus.DELETED);
      return;
    }
    this.setStatus(UploadStatus.PENDING);

    try {
      yield attachmentsApi.deleteAttachment(
        this.attachmentId, meetingSlug, token,
      );
      this.setStatus(UploadStatus.DELETED);
    } catch (error) {
      toast.show({
        message: 'Error removing attachment',
        type: 'error',
      });
      this.setStatus(currentStatus);
    }
  })

  _uploadToS3 = flow(function* (postUrl, extraParams) {
    const s3Util = new S3Util();
    this.setStatus(UploadStatus.STARTED);
    try {
      const resp = yield s3Util.uploadAttachment(
        postUrl, this.file, extraParams,
      );
      this.attachmentId = resp.ownerId;
      this.setUrl(resp.url);
      this.setStatus(UploadStatus.SUCCESS);
    } catch (error) {
      toast.show({
        message: error.message,
        type: 'error',
      });
      this.setStatus(UploadStatus.FAILURE);
    }
  })
}

export default Attachment;
