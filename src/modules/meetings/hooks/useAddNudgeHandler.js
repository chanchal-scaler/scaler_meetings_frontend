import { useCallback } from 'react';

import {
  canShowNudge,
  GENERIC_NUDGE_ADDED_EVENT,
  GENERIC_NUDGE_REMOVED_EVENT,
  recordNudgeShown,
} from '~meetings/utils/genericNudge';
import { useAddEventListener } from '@common/hooks';

function useAddNudgeHandler(nudgeStore) {
  const { currentNudge } = nudgeStore;

  const addNudge = useCallback(async (event) => {
    if (canShowNudge({ currentNudge, newNudgeType: event.detail.nudgeType })) {
      nudgeStore.setCurrentNudge(event.detail);
      recordNudgeShown(event.detail.nudgeType);
    }
  }, [currentNudge, nudgeStore]);

  useAddEventListener({
    eventType: GENERIC_NUDGE_ADDED_EVENT,
    callback: addNudge,
  });

  // handling nudge closes
  const removeNudgesFromView = useCallback(() => {
    nudgeStore.removeCurrentNudge();
  }, [nudgeStore]);

  useAddEventListener({
    eventType: GENERIC_NUDGE_REMOVED_EVENT,
    callback: removeNudgesFromView,
  });
}

export default useAddNudgeHandler;
