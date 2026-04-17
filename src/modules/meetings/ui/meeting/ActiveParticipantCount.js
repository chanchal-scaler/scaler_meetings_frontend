import { ACTIVE_PARTICIPANT_LIMIT } from '~meetings/utils/messaging';
import { mobxify } from '~meetings/ui/hoc';

function ActiveParticipantCount({ meetingStore: store }) {
  const { meeting } = store;
  const activeCount = meeting.activeParticipants.length;

  if (meeting.isSuperHost || activeCount <= ACTIVE_PARTICIPANT_LIMIT) {
    return activeCount;
  } else {
    return `${ACTIVE_PARTICIPANT_LIMIT}+`;
  }
}

export default mobxify('meetingStore')(ActiveParticipantCount);
