import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { mobxify } from '~meetings/ui/hoc';
import {
  REACTION_LIST,
  reactionsNativeEmojiMap,
  reactionsTextMap,
} from '~meetings/utils/reactions';
import { Badge, Icon, Tappable } from '@common/ui/general';
import { isMobile } from '@common/utils/platform';
import { toast } from '@common/ui/general/Toast';
import analytics from '@common/utils/analytics';
import ReactionTooltip from './ReactionTooltip';

function Reaction({
  isDisabled,
  messaging,
  reactions,
  type,
}) {
  const totalReactions = reactions.responses[type].length;
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    let timerId = '';

    if (totalReactions > 0) {
      setAnimate(true);
      timerId = setTimeout(() => setAnimate(false), 500);
    }

    return () => timerId && clearTimeout(timerId);
  }, [totalReactions]);

  const hasReacted = reactions.hasReacted(type);

  const handleReaction = useCallback(() => {
    if (isDisabled) {
      toast.show({
        message: 'Reactions have been disabled by host for you!',
      });
    } else {
      messaging.sendReaction(type);
      analytics.click({
        click_type: DRONA_TRACKING_TYPES.dronaChatReactionClick,
        click_source: DRONA_SOURCES.meetingChatWindow,
        click_feature: DRONA_FEATURES.reactions,
        click_text: type,
        custom: {
          upvote: type === 'plus_one',
        },
      });
    }
  }, [isDisabled, messaging, type]);

  return (
    <Tappable
      key={type}
      className={classNames(
        'chat-reactions__item',
        {
          'chat-reactions__item--reacted': hasReacted,
          'chat-reactions__item--disabled': isDisabled || (
            !reactions.canReact && !hasReacted
          ),
          'chat-reactions__item--animate': animate,
        },
      )}
      gtmEventType="chat_emoticon"
      gtmEventResult={reactionsTextMap[type]}
      gtmEventAction="click"
      gtmEventCategory="drona"
      onClick={handleReaction}
    >
      <div className="chat-reactions__text">
        {reactionsTextMap[type]}
      </div>
      <span className="chat-reactions__emoji" aria-hidden="true">
        {reactionsNativeEmojiMap[type]}
      </span>
      {totalReactions > 0 && (
        <Badge
          className="chat-reactions__badge"
          position={{ top: '-1rem', right: '-0.5rem' }}
          small
          type="default"
        >
          <div className="chat-reactions__count">
            {totalReactions}
          </div>
        </Badge>
      )}
    </Tappable>
  );
}

function ChatReactions({ meetingStore: store }) {
  const { meeting } = store;
  const { manager, messaging, isChatInputVisible } = meeting;
  const { reactions } = messaging;

  const handleClick = useCallback(() => {
    meeting.setChatInputVisible(!isChatInputVisible);
    meeting.setMobilePanelExpanded(!isChatInputVisible);
  }, [isChatInputVisible, meeting]);

  const handleAskQuestion = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaAskQuestionButtonClick,
    });
    meeting.setActiveTab('questions');
  }, [meeting]);

  // On unmount hide chat input on mobile so that when mounted back it does
  // not automatically popup virtual keyboard
  useEffect(() => () => {
    if (isMobile()) {
      meeting.setChatInputVisible(false);
    }
  }, [meeting]);

  if (!meeting.isGhost) {
    return (
      <div className="chat-reactions">
        <div className="chat-reactions__content">
          {!meeting.isSuperHost && (
            <Tappable
              className="chat-reactions__question"
              gtmEventType="ask_a_question"
              gtmEventAction="click"
              gtmEventCategory="drona"
              onClick={handleAskQuestion}
            >
              <Icon name="question m-r-5" className="icon-question-fill" />
              <span className="h6 no-mgn-b">Ask Question</span>
            </Tappable>
          )}
          <div className="chat-reactions__list">
            {REACTION_LIST.map((type) => (
              <Reaction
                key={`${type}-${reactions.responses[type].length}`}
                isDisabled={manager.isChatDisabled}
                messaging={messaging}
                reactions={reactions}
                type={type}
              />
            ))}
            {
              isMobile()
                && (
                  <Tappable
                    className={classNames(
                      'btn btn-small btn-icon m-l-5',
                      { 'btn-primary': isChatInputVisible },
                    )}
                    onClick={handleClick}
                  >
                    <Icon name="keyboard" />
                  </Tappable>
                )
            }
          </div>
        </div>
        {!meeting.isSuperHost && <ReactionTooltip />}
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(ChatReactions);
