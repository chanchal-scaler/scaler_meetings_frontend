import React, { useCallback } from 'react';

import {
  DRONA_FEATURES, DRONA_TRACKING_TYPES,
  DRONA_SOURCES,
} from '~meetings/utils/trackingEvents';
import { Icon, Tappable } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';

function NoticeBoardFormBody({ meetingStore: store, onClose }) {
  const { meeting } = store;
  const { noticeBoard } = meeting;

  const {
    messageTitle, messageDescription, messageLink,
  } = noticeBoard || {};

  const handlePin = useCallback(() => {
    noticeBoard.pinMessage();
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardPinMessageClick,
      click_source: DRONA_SOURCES.meetingNoticeBoardModal,
      click_feature: DRONA_FEATURES.noticeBoard,
      custom: {
        title: messageTitle,
        description: messageDescription,
        link: messageLink,
      },
    });
  }, [messageDescription, messageLink, messageTitle, noticeBoard]);

  const handleDescriptionChange = useCallback((event) => {
    noticeBoard.setNoticeBoardMessageDescription(event.target.value);
  }, [noticeBoard]);

  const handleTitleChange = useCallback((event) => {
    noticeBoard.setNoticeBoardMessageTitle(event.target.value);
  }, [noticeBoard]);

  const handleLinkChange = useCallback((event) => {
    noticeBoard.setNoticeBoardMessageLink(event.target.value);
  }, [noticeBoard]);

  return (
    <>
      {!messageTitle && (
        <label className="m-notice-board-form-placeholder">
          <Icon
            name="alphabet"
            className="m-notice-board-form-placeholder__icon"
          />
          Enter Title
        </label>
      )}
      <input
        className="m-notice-board-form-input"
        placeholder=""
        value={messageTitle}
        onChange={handleTitleChange}
      />
      {!messageTitle && (
        <div className="danger h5 m-t-5 m-l-5">
          *Title Required to pin message
        </div>
      )}
      {!messageDescription && (
        <label className="
          m-notice-board-form-placeholder
          m-notice-board-form-placeholder--description
        "
        >
          <Icon
            name="left-align"
            className="m-notice-board-form-placeholder__icon"
          />
          Enter Description ( Optional )
        </label>
      )}
      <textarea
        type="text"
        required
        rows={5}
        onChange={handleDescriptionChange}
        className="
          m-notice-board-form-input m-notice-board-form-input--description
        "
        value={messageDescription}
      />
      {!messageLink && (
        <label className="m-notice-board-form-placeholder">
          <Icon
            name="link-new"
            className="m-notice-board-form-placeholder__icon"
          />
          Enter URL ( Optional )
        </label>
      )}
      <input
        type="url"
        onChange={handleLinkChange}
        className="m-notice-board-form-input"
        value={messageLink}
      />
      <div className="m-notice-board-form-footer">
        <Tappable
          onClick={onClose}
          className="btn btn-long btn-primary m-r-15
           btn-outlined m-notice-board-form-input"
        >
          Close
        </Tappable>
        <Tappable
          disabled={!messageTitle}
          onClick={handlePin}
          className="btn btn-long btn-primary m-notice-board-form-input"
        >
          Pin Message
        </Tappable>
      </div>
    </>
  );
}

export default mobxify('meetingStore')(NoticeBoardFormBody);
