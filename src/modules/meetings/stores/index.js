import { isDevelopment } from '@common/utils/debug';
import attachmentStore from './attachmentStore';
import layoutStore from './layoutStore';
import mediaStore from './mediaStore';
import meetingStore from './meetingStore';
import pluginsStore from './pluginsStore';
import nudgeStore from './nudgeStore';
import pollStore from './pollStore';
import surveyStore from './surveyStore';
import quizStore from './quizStore';
import settingsStore from './settingsStore';
import genericNudgeStore from './genericNudgeStore';

const stores = {
  layoutStore,
  mediaStore,
  meetingStore,
  quizStore,
  pollStore,
  surveyStore,
  settingsStore,
  attachmentStore,
  pluginsStore,
  nudgeStore,
  genericNudgeStore,
};

if (isDevelopment()) {
  window.stores = stores;
}

export default stores;
