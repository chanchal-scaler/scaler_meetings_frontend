import React from 'react';

import {
  DRONA_FEATURES, DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { mobxify } from '~meetings/ui/hoc';
import { Tappable, VectorIcon } from '@common/ui/general';
import analytics from '@common/utils/analytics';
import FloatingBotImg from '~meetings/images/ai_avatars/floating_bot.webp';
import shadeImg from '~meetings/images/ai_avatars/bg-shade.svg';

const points = [
  'AI bot to help answer questions '
  + '(This is a Beta version, Bot may make mistakes)',
  'All Answers are overseen by instructors.',
  'Bot is only for free classes; Instructors answer '
  + 'questions live in Premium Classes',
];

function AiSidekick({ meetingStore: store }) {
  const { meeting } = store;
  const {
    isAutoResponsesEnabled,
    isAcknowledgingAiSidekickBanner,
    isAiSidekickVisible,
  } = meeting;

  const handleClick = () => {
    meeting.acknowledgeAiSidekickBanner();
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaAutoResponseGotItClick,
      click_feature: DRONA_FEATURES.botResponse,
    });
  };

  if (isAiSidekickVisible && isAutoResponsesEnabled) {
    return (
      <div className="m-sidekick-intro">
        <div className="m-sidekick-intro__new-tag">
          NEW
        </div>
        <div className="m-sidekick-intro__title">
          <span className="bold">Instructor's</span>
          {' '}
          <span>Sidekick</span>
        </div>
        <div className="m-sidekick-intro__body">
          {points.map((point) => (
            <div className="m-sidekick-intro__point" key={point}>
              <VectorIcon
                name="star-bullet"
                className="m-sidekick-intro--point-icon"
              />
              <span>{point}</span>
            </div>
          ))}
        </div>
        <Tappable
          disabled={isAcknowledgingAiSidekickBanner}
          className="btn-primary btn-inverted m-sidekick-intro__cta"
          onClick={handleClick}
        >
          Got It
        </Tappable>
        <img src={shadeImg} alt="" className="m-sidekick-intro__bg" />
        <img
          src={FloatingBotImg}
          alt=""
          className="m-sidekick-intro__anim"
        />
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(AiSidekick);
