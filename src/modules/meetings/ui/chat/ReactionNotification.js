import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Emoji } from 'emoji-mart';

import { mobxify } from '~meetings/ui/hoc';
import { reactionsEmojiMap } from '~meetings/utils/reactions';

const ANIMATION_TIMEOUT = 2250;

function Reactions({ type }) {
  const [visible, setVisibility] = useState(true);

  useEffect(() => {
    const timerId = setTimeout(
      () => setVisibility(false), ANIMATION_TIMEOUT,
    );

    return () => clearTimeout(timerId);
  }, []);

  return (
    visible ? (
      <div className="reactions-notification__item">
        <Emoji
          emoji={reactionsEmojiMap[type]}
          size={25}
        />
      </div>
    ) : null
  );
}

function ReactionNotification({ meetingStore: store }) {
  const { meeting } = store;
  const {
    messaging: { reactions },
    manager,
  } = meeting;

  return (
    <div
      className={classNames(
        'reactions-notification',
        {
          'reactions-notification--bottom-offset': (
            manager.doubtSessionStarted
            || (meeting.doubtSessionAllowed && meeting.isSuperHost)
          ),
        },
      )}
    >
      {reactions.reactions.map((type, index) => (
        <Reactions
          key={`emoji-${index}`}
          type={type}
        />
      ))}
    </div>
  );
}

export default mobxify('meetingStore')(ReactionNotification);
