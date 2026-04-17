import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';

import { toast } from '@common/ui/general/Toast';
import attachmentsApi from '~meetings/api/attachments';
import Attachment from '~meetings/models/attachment';
import {
  UploadStatus, FileType, toMB,
} from '~meetings/utils/attachments';

class AttachmentStore {
  // List of all attachment models
  attachments = [];

  isLoading = false;

  hasLoaded = false;

  // Indicates if the loading failed
  hasError = false;

  // Url for initializing attachments upload
  postUrl = null;

  // Indicates on which component the store is being used
  source = null;

  // Current meeting name. Only used on super host upload page
  meetingName = null;

  meetingSlug = null;

  // Token used for file actions.
  token = null;

  // Notes upload modal open in archive section?
  isUploadModalOpen = false;

  // Max File Size in Mega Bytes
  MAX_FILE_SIZE = 30;

  // Add supported file types in here
  SUPPORTED_FILE_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'application/pdf',
    'application/msword', 'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/x-python-script', 'application/x-ipynb+json',
  ];

  constructor() {
    makeObservable(this, {
      isLoading: observable,
      hasError: observable,
      attachments: observable.shallow,
      hasLoaded: observable,
      isUploadModalOpen: observable,
      meetingName: observable,
      meetingSlug: observable,
      token: observable,
      postUrl: observable,
      source: observable,
      allAttachments: computed,
      allAttachmentsCount: computed,
      availableAttachments: computed,
      availableAttachmentsCount: computed,
      setData: action.bound,
      setUploadModalState: action.bound,
      enqueueAttachment: action.bound,
      loadAttachments: action.bound,
      reloadAttachments: action.bound,
      reset: action.bound,
    });
  }

  get allAttachments() {
    return this.attachments.filter(
      attch => attch.status !== UploadStatus.DELETED,
    );
  }

  get allAttachmentsCount() {
    return this.allAttachments.length;
  }

  get availableAttachments() {
    return this.allAttachments.filter(
      attch => attch.status !== UploadStatus.FAILURE,
    );
  }

  get availableAttachmentsCount() {
    return this.availableAttachments.length;
  }

  setData(data) {
    this.token = data.token;
    this.postUrl = data.postUrl;
    this.source = data.source;
    this.meetingSlug = data.meetingSlug;
  }

  reset() {
    this.hasLoaded = false;
    this.attachments = [];
  }

  setUploadModalState(isOpen) {
    this.isUploadModalOpen = isOpen;
  }

  enqueueAttachment(file) {
    let attachment;
    try {
      this._checkAttachmentValidity(file);
      attachment = new Attachment(this, file);
      this.attachments.push(attachment);
      this.track(this.source);
    } catch (error) {
      toast.show({
        message: error.message,
        type: 'error',
      });
    }
  }

  loadAttachments = flow(function* () {
    if (this.isLoading || this.hasLoaded) {
      return;
    }
    this.isLoading = true;
    try {
      const response = yield attachmentsApi.loadAttachments(
        this.meetingSlug, this.token,
      );
      const { attachments, meeting } = response;
      this.meetingName = meeting;
      attachments.forEach(attachment => {
        const fileParams = {
          name: attachment.filename,
          size: attachment.filesize,
          type: attachment.filetype,
          url: attachment.expiring_url,
        };
        const newAttachment = new Attachment(
          this,
          fileParams,
          FileType.PROXY_FILE,
          UploadStatus.SUCCESS,
          attachment.attachment_id,
        );
        this.attachments.push(newAttachment);
      });
    } catch (error) {
      toast.show({
        message: 'Error loading attachments',
        type: 'error',
      });
      this.hasError = true;
    } finally {
      this.isLoading = false;
      this.hasLoaded = true;
    }
  })

  reloadAttachments() {
    this.hasLoaded = false;
    this.hasError = false;
    this.loadAttachments();
  }

  // eslint-disable-next-line class-methods-use-this
  track(actionType, ...args) {
    return new Promise(resolve => {
      if (window.storeEsEvent) {
        window.storeEsEvent(actionType, ...args);
      }
      resolve();
    });
  }

  _checkAttachmentValidity(file) {
    if (this.SUPPORTED_FILE_TYPES.indexOf(file.type) < 0) {
      throw new Error(`
        Supported file types are ${this.SUPPORTED_FILE_TYPES.join(', ')}
      `);
    } else if (this.MAX_FILE_SIZE < toMB(file.size)) {
      throw new Error(`
        File size should be below ${this.MAX_FILE_SIZE} MB
      `);
    }

    return true;
  }
}

const attachmentStore = new AttachmentStore();

export default attachmentStore;
