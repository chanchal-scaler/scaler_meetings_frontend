import classNames from 'classnames';
import React, { useCallback, useState } from 'react';

import { DISABLE_HTML_REMARKABLE_OPTIONS } from '@common/utils/remarkable';
import {
  DRONA_FEATURES, DRONA_TRACKING_TYPES,
  DRONA_SOURCES,
} from '~meetings/utils/trackingEvents';
import { getDeviceType } from '@common/utils/platform';
import { Icon, Tappable } from '@common/ui/general';
import { MdRenderer } from '@common/ui/markdown';
import { MEETING_TABS } from '~meetings/utils/constants';
import { mobxify } from '~meetings/ui/hoc';
import { useAddEventListener } from '@common/hooks';
import analytics from '@common/utils/analytics';
import NoticeBoardCard from '~meetings/ui/notice_board/NoticeBoardCard';

function NoticeBoardV2({ meetingStore: store, canAdd, noticeBoard }) {
  const { archive, meeting } = store;
  const meetingModel = archive || meeting;
  const [notificationActive, setNotificationActive] = useState(false);

  const handleView = useCallback((e) => {
    meetingModel.setActiveTab(MEETING_TABS.noticeBoard);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardArrowStripClick,
      click_source: DRONA_SOURCES.meetingChatWindowNoticeBoard,
      click_feature: DRONA_FEATURES.noticeBoard,
    });
    e.stopPropagation();
  }, [meetingModel]);

  const handleCardClick = useCallback(() => {
    meetingModel.setActiveTab(MEETING_TABS.noticeBoard);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardChatBanner,
      click_source: DRONA_SOURCES.meetingChatWindowNoticeBoard,
      click_feature: DRONA_FEATURES.noticeBoard,
    });
  }, [meetingModel]);

  const handleAdd = useCallback((e) => {
    noticeBoard.setFormOpen(true);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardAddButtonClick,
      click_source: DRONA_SOURCES.meetingChatWindowNoticeBoard,
      click_feature: DRONA_FEATURES.noticeBoard,
    });
    e.stopPropagation();
  }, [noticeBoard]);

  const handlePopupClick = useCallback((e) => {
    meetingModel.setActiveTab(MEETING_TABS.noticeBoard);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardPopupClick,
      click_source: DRONA_SOURCES.meetingChatWindowNoticeBoard,
      click_feature: DRONA_FEATURES.noticeBoard,
    });
    e.stopPropagation();
  }, [meetingModel]);

  // handling notification UI
  const notifyMessageAdded = useCallback(() => {
    setNotificationActive(true);
    const timeout = setTimeout(() => {
      setNotificationActive(false);

      return () => clearTimeout(timeout);
    }, 2980);
  }, []);

  useAddEventListener({
    eventType: 'NOTICE_BOARD_MESSAGE_ADDED_EVENT',
    callback: notifyMessageAdded,
  });

  // fetching last pinned messages. messages are sorted in desc order
  // based on created at so 0th message is latest
  const lastPinnedMessage = noticeBoard.messages.length > 0
    && noticeBoard.messages[0];

  // Using this to check if the device is mobile or not
  // as meeting chat can be used in Landscape mode on mobile
  // which evaluates to tablet
  const mobile = getDeviceType() === 'mobile';

  return (
    <Tappable
      onClick={handleCardClick}
      className={classNames(
        'm-notice-board-chat-banner',
        {
          'm-notice-board-chat-banner--active':
           notificationActive,
        },
      )}
    >
      <div className={classNames(
        'm-notice-board-chat-banner-top',
        {
          'm-notice-board-chat-banner-top--active':
             notificationActive,
        },
      )}
      >
        <div className="m-notice-board-chat-banner-top__header">
          <div className="row flex-ac">
            <Icon name="noticeboard-filled" className="notice-board-icon" />
            {' '}
            Notice Board
            {noticeBoard.unreadMessageCount > 0 && (
              <div className={classNames(
                'm-notice-board-chat-banner-unread',
                {
                  'm-notice-board-chat-banner-unread--active':
                     notificationActive,
                },
              )}
              >
                {noticeBoard.unreadMessageCount}
              </div>
            )}
          </div>
          {notificationActive && (
            <div>New Pin</div>
          )}
          {!notificationActive && (
            <div className="row flex-ac">
              {canAdd && (
                <Tappable
                  className="
                    m-notice-board-chat-banner-buttons no-highlight m-r-10
                  "
                  onClick={handleAdd}
                >
                  <Icon name="add" className="h3" />
                </Tappable>
              )}
              <Tappable
                className="m-notice-board-chat-banner-buttons no-highlight"
                onClick={handleView}
              >
                <Icon name="chevron-right" className="h3" />
              </Tappable>
            </div>
          )}
        </div>
        {noticeBoard.messages.length > 0 && (
          <div className="m-notice-board-chat-banner-top__recent ellipsis">
            <MdRenderer
              options={DISABLE_HTML_REMARKABLE_OPTIONS}
              mdString={
                JSON.parse(lastPinnedMessage?.body)?.description
                || JSON.parse(lastPinnedMessage?.body)?.title
              }
            />
          </div>
        )}
      </div>
      {!mobile && (
        <Tappable
          onClick={handlePopupClick}
          className={classNames(
            'm-notice-board-chat-banner-bottom',
            'no-highlight',
            {
              'm-notice-board-chat-banner-bottom--active':
                notificationActive,
            },
          )}
        >
          {lastPinnedMessage && (
            <NoticeBoardCard
              key={lastPinnedMessage.pinId}
              message={lastPinnedMessage}
              canDelete={false}
            />
          )}
        </Tappable>
      )}
    </Tappable>
  );
}

export default mobxify('meetingStore')(NoticeBoardV2);
