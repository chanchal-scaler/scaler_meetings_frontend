import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import { DISABLE_HTML_REMARKABLE_OPTIONS } from '@common/utils/remarkable';
import { Icon } from '@common/ui/general';
import { MdRenderer } from '@common/ui/markdown';
import { toHHmm } from '@common/utils/date';
import MeetingParticipantActions from '~meetings/ui/MeetingParticipantActions';

function TextMessage({ message }) {
  const [areActionsOpen, setActionsOpen] = useState(false);
  const { meeting } = message;

  const canSendMessage = (
    meeting.isLive
    && !message.isMine
    && meeting.messaging
    && meeting.messaging.sendToUserIds.has(message.fromId)
  );

  const isProxyIndicatorVisible = meeting.isSuperHost && message.fromProxyUser;

  const handleSendMessage = useCallback(() => {
    if (canSendMessage) {
      meeting.messaging.setMessageToId(message.fromId);
    }
  }, [canSendMessage, meeting, message]);

  function errorUi() {
    if (message.sendError) {
      return (
        <div className="message-text__error">
          <span className="danger m-r-5">
            Failed to send message.
          </span>
          <button
            className="link"
            onClick={() => message.send()}
            type="button"
          >
            Try again
          </button>
        </div>
      );
    } else {
      return null;
    }
  }

  function actionsUi() {
    if (
      meeting.isSuperHost
      && !message.isMine
      && !message.from.isHost
      && meeting.isLive
    ) {
      return (
        <MeetingParticipantActions
          className="message-actions"
          areActionsOpen={areActionsOpen}
          setActionsOpen={setActionsOpen}
          fromId={message.fromId}
          messageBody={message.body}
          message={message}
        />
      );
    } else {
      return null;
    }
  }

  function headUi() {
    return (
      <div className="message-text__header">
        <div className="message-text__from">
          {meeting.isLive && (
            <div
              className={classNames(
                'message-text__availability',
                { 'message-text__availability--online': message.from.isActive },
                {
                  'message-text__availability--proxy':
                  isProxyIndicatorVisible,
                },
              )}
            />
          )}
          {/* eslint-disable-next-line */}
          <span
            className={classNames(
              'message-text__author',
              { cursor: canSendMessage },
            )}
            onClick={handleSendMessage}
          >
            {message.fromLabel}
          </span>
        </div>
        <div
          className={classNames(
            'message-text__to',
            { 'message-text__to--public': message.isPublic },
            { 'message-text__to--private': !message.isPublic },
          )}
        >
          To:
          {' '}
          {message.toLabel}
        </div>
        <div className="message-text__date">
          {toHHmm(message.timestamp)}
        </div>
      </div>
    );
  }

  function pinUi() {
    return (
      <div className="message-text__pin m-b-5">
        <Icon name="pin" className="message-pin-icon m-r-5" />
        Pinned
      </div>
    );
  }

  function bodyUi() {
    return (
      <div className="message-text__body">
        <MdRenderer
          options={DISABLE_HTML_REMARKABLE_OPTIONS}
          mdString={message.body}
        />
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'message-text',
        { 'message-text--pinned': message.isPinned },
        { 'message-text--mine': message.isMine },
        { 'message-text--others': !message.isMine },
        { 'message-text--active': areActionsOpen },
      )}
    >
      {message.isPinned && pinUi()}
      {headUi()}
      {bodyUi()}
      {errorUi()}
      {actionsUi()}
    </div>
  );
}

export default observer(TextMessage);
