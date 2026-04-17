import React, { useCallback } from 'react';

import { dialog } from '@common/ui/general/Dialog';
import { mobxify } from '~meetings/ui/hoc';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import { Tappable } from '@common/ui/general';

function BoostUpvotes({
  meetingStore,
  question,
  userId,
  onClick,
}) {
  const { meeting } = meetingStore;

  const handleBoostUpvotes = useCallback((event) => {
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content: 'Proceeding will move the question to the top.',
      onOk: () => question.boostUpvotes(),
    });
    if (onClick) {
      onClick(event);
    }
  }, [question, onClick]);

  // only visible for proxy questions created by superhosts
  if (
    meeting
    && meeting.isSuperHost
    && meeting.getParticipant(userId).roleLevel > 1
  ) {
    return (
      <Tappable
        className="btn btn-small btn-inverted btn-sharp"
        onClick={handleBoostUpvotes}
      >
        Boost Upvotes
      </Tappable>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(BoostUpvotes);
