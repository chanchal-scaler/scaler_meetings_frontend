import React, { useMemo } from 'react';
import classNames from 'classnames';

import { AcknowledgementAction, EndCallAction } from './nudge_actions';
import { Backdrop } from '@common/ui/general';
import { MdRenderer } from '@common/ui/markdown';
import { mobxify } from '~meetings/ui/hoc';
import { NUDGE_ACTIONS, NUDGE_TYPES } from '~meetings/utils/nudges';
import { useMediaQuery } from '@common/hooks';

function NudgeActionContainer({ cta, chatMessageId }) {
  if (cta.action_type === NUDGE_ACTIONS.endMeeting) {
    return (
      <EndCallAction
        label={cta.label}
      />
    );
  } else if (cta.action_type === NUDGE_ACTIONS.acknowledgement) {
    return (
      <AcknowledgementAction
        label={cta.label}
        chatMessageId={chatMessageId}
      />
    );
  } else {
    return null;
  }
}

function Nudge({ meetingStore }) {
  const {
    meeting: { nudge, videoBroadcasting: { isLiveScreenShared } },
  } = meetingStore;
  const { currentNudge } = nudge || {};
  const { mobile } = useMediaQuery();

  const isNudgeAllowed = useMemo(() => {
    if (currentNudge) {
      if (currentNudge.nudge_for === NUDGE_TYPES.screenShare
        && isLiveScreenShared) {
        nudge.removeCurrentNudge();
        return false;
      } else {
        return true;
      }
    }
    return false;
  }, [currentNudge, isLiveScreenShared, nudge]);

  if (isNudgeAllowed) {
    const { chat_message_id: chatMessageId, ctas } = currentNudge;

    const placement = mobile ? 'center' : currentNudge.placement;

    return (
      <>
        <Backdrop
          isOpen
          onClose={() => {}}
        />
        <div
          className={classNames(
            'm-nudge', `m-nudge--${placement}`,
          )}
        >
          <div className="m-v-10">
            <MdRenderer mdString={currentNudge.title} />
          </div>
          {currentNudge.subtitle && (
            <div className="m-b-20">
              <MdRenderer
                mdString={currentNudge.subtitle}
                className="h5 hint normal"
              />
            </div>
          )}
          <div className="m-v-10">
            <MdRenderer
              mdString={currentNudge.content}
              className="m-nudge__content-container"
            />
          </div>
          <div className="m-nudge__action-container">
            {ctas?.map((cta, index) => (
              <div key={index} className="m-r-5">
                <NudgeActionContainer cta={cta} chatMessageId={chatMessageId} />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(Nudge);
