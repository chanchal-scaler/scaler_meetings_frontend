import React, {
  useCallback, useState,
} from 'react';
import classNames from 'classnames';

import {
  Accordion, Icon, Tappable, Textarea,
} from '@common/ui/general';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { DISABLE_HTML_REMARKABLE_OPTIONS } from '@common/utils/remarkable';
import { MdRenderer } from '@common/ui/markdown';
import { mobxify } from '~meetings/ui/hoc';
import { toast } from '@common/ui/general/Toast';
import { toHHmm } from '@common/utils/date';
import { VIEW_TYPES } from '@vectord/analytics';
import analytics from '@common/utils/analytics';
import HotKey from '@common/lib/hotKey';

function NoticeBoard({ canAdd, noticeBoard }) {
  const [inputOpen, setInputOpen] = useState(false);

  const handleChange = useCallback(({ target }) => {
    noticeBoard.setNoticeBoardInput(target.value);
  }, [noticeBoard]);

  const handleKeyDown = useCallback((event) => {
    const hotKey = new HotKey(event);
    if (hotKey.didPress('enter') && !hotKey.didPress('shift+enter')) {
      event.preventDefault();
      if (noticeBoard.messageInput.trim() === '') {
        toast.show({
          message: 'Please enter a message',
          type: 'error',
        });
        return;
      }
      noticeBoard.pinMessage();
      setInputOpen(false);
    }
  }, [noticeBoard]);

  const handlePinnedMessageAccordionClick = useCallback((isOpen) => {
    analytics.view({
      view_name: DRONA_TRACKING_TYPES.dronaPinnedMessagesDropdownClick,
      view_type: VIEW_TYPES.section,
      view_feature: DRONA_FEATURES.pinnedMessage,
      view_source: DRONA_SOURCES.meetingChatWindow,
      custom: {
        is_open: isOpen,
      },
    });
  }, []);

  const handleLinkClick = useCallback((text) => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaPinnedMessageLinkClick,
      click_source: DRONA_SOURCES.meetingChatWindow,
      click_feature: DRONA_FEATURES.pinnedMessage,
      click_text: text,
    });
  }, []);

  const contentUi = (active) => {
    if (inputOpen) {
      return (
        <Textarea
          className="notice-board__input m-r-5"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type message"
          onClick={(e) => { e.stopPropagation(); }}
          value={noticeBoard.messageInput}
          autoFocus
          required
          maxRows={7}
        />
      );
    } else if (active) {
      return (
        <span className="notice-board__recent m-r-5">Pinned messages</span>
      );
    } else {
      return (
        <span className="notice-board__recent m-r-5">
          {noticeBoard.messages.length > 0 ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleLinkClick(noticeBoard.messages[0].body)}
            >
              <MdRenderer
                options={DISABLE_HTML_REMARKABLE_OPTIONS}
                mdString={noticeBoard.messages[0].body}
              />
            </div>
          ) : (
            <Tappable
              className="btn btn-light pin-message-button"
              onClick={(e) => {
                e.stopPropagation();
                setInputOpen(true);
                analytics.click({
                  click_type: DRONA_TRACKING_TYPES.dronaPinnedMessageAddClick,
                  click_source: DRONA_SOURCES.meetingChatWindow,
                  click_feature: DRONA_FEATURES.pinnedMessage,
                  click_text: 'Pin a message',
                });
              }}
            >
              Pin a message
            </Tappable>
          )}
        </span>
      );
    }
  };

  const headerUI = ({ active, onClick }) => (
    <div
      className="notice-board__header"
      role="presentation"
      onClick={onClick}
    >
      {contentUi(active)}
      {canAdd && (
        <Tappable
          className="btn btn-icon btn-small btn-light"
          onClick={(e) => {
            e.stopPropagation();
            setInputOpen(!inputOpen);
          }}
        >
          <Icon
            name={inputOpen ? 'clear' : 'add'}
            className="notice-board__icon"
          />
        </Tappable>
      )}
      <Tappable
        className="btn btn-icon btn-small btn-light"
        onClick={onClick}
      >
        <Icon
          name={active ? 'chevron-up' : 'chevron-down'}
          className="notice-board__icon"
        />
      </Tappable>
    </div>
  );

  if (!canAdd && noticeBoard.messages.length === 0) { return null; } else {
    return (
      <>
        <Accordion
          title={headerUI}
          className="notice-board"
          id="m-notice-board"
          onClick={handlePinnedMessageAccordionClick}
        >
          <div className="notice-board__body">
            {noticeBoard.messages.length === 0 ? (
              <div className="pin-message">
                <div
                  className={classNames(
                    'pin-message__body',
                    'pin-message__body--empty',
                  )}
                >
                  No pinned messages yet
                </div>
              </div>
            ) : (
              <>
                {noticeBoard.messages.map((message, index) => (
                  <div className="pin-message" key={index}>
                    <div className="pin-message__header">
                      {message.fromLabel}
                      <span className="m-l-10">
                        {toHHmm(message.timestamp)}
                      </span>
                    </div>
                    <div
                      className="pin-message__body"
                      role="button"
                      tabIndex={0}
                      onClick={() => handleLinkClick(message.body)}
                    >
                      <MdRenderer
                        mdString={message.body}
                      />
                      {canAdd && (
                        <Tappable
                          className="btn btn-icon btn-small btn-dark unpin-icon"
                          onClick={() => (
                            noticeBoard.unpinMessage(message.pinId)
                          )}
                        >
                          <Icon name="trash" />
                        </Tappable>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </Accordion>
      </>
    );
  }
}

export default mobxify('meetingStore', 'settingsStore')(NoticeBoard);
