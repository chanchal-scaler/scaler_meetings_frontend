import React, { useCallback, useEffect } from 'react';

import { dialog } from '@common/ui/general/Dialog';
import { DockItem } from '~meetings/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import { TourGuide } from '@common/ui/general';

const DOUBT_SESSION_TIPS = [
  'Click on this button when you start resolving doubts at the end of the'
    + ' session',
  'Attendance for the doubt resolution period is optional for the audience',
  'If you indicate doubt resolution start time, it will helps us in updating '
    + ' the attendance in a more accurate way.',
];
const DOUBT_SESSION_GUIDE_NAME = 'doubt-session-feature';

function DoubtSession({ meetingStore: store, settingsStore }) {
  const { meeting } = store;
  const { manager, playlist } = meeting;

  const isStartDoubtsButtonVisible = meeting.doubtSessionAllowed
    && meeting.isSuperHost
    && !playlist?.hasDoubtSessionCard;

  const handleDoubtSession = useCallback(() => {
    const data = {
      name: SINGLETONS_NAME,
      title: 'Start Doubt Session?',
      content: (
        <>
          Proceeding will start doubt session and
          {' '}
          <span className="dark bold">
            attendance for doubt sessions is not considered
          </span>
        </>
      ),
      onOk: () => manager.startDoubtSession(),
      okLabel: 'Start Doubt Session',
      okClass: 'btn-primary',
      cancelLabel: 'Cancel',
    };
    dialog.show(data);
  }, [manager]);

  useEffect(() => {
    if (
      meeting.doubtSessionAllowed
      && meeting.isSuperHost
      && !settingsStore.doubtSessionTourCompleted
    ) {
      TourGuide.start(DOUBT_SESSION_GUIDE_NAME);
      settingsStore.setDoubtSessionTourCompleted(true);
    }
  }, [meeting.doubtSessionAllowed, meeting.isSuperHost, settingsStore]);

  if (manager.doubtSessionStarted) {
    return (
      <div
        className="
          text-c h5 p-5 warning bold m-b-10
          anim-blink anim-blink--slow
        "
      >
        Doubt Session Ongoing
      </div>
    );
  } else if (isStartDoubtsButtonVisible) {
    return (
      <>
        <DockItem
          className="right-dock__tab"
          icon="bulb"
          id="doubt-session-btn"
          data-cy="meetings-doubt-session-button"
          label="Start Doubt Session"
          onClick={handleDoubtSession}
        />
        <TourGuide name={DOUBT_SESSION_GUIDE_NAME}>
          {DOUBT_SESSION_TIPS.map((tip, index) => (
            <TourGuide.Slide
              key={index}
              maskPadding={0}
              selector="#doubt-session-btn"
            >
              {tip}
            </TourGuide.Slide>
          ))}
        </TourGuide>
      </>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore', 'settingsStore')(DoubtSession);
