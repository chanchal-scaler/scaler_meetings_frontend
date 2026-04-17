import { generateUUID } from '@common/utils/misc';
import ACTIONS from '~analytics/store/actions';

const { referrer } = document;

const initialState = {
  initialized: false,
  sessionId: generateUUID(),
  offline: !navigator.onLine,
  userAgent: navigator.userAgent,
  referrer,
};

// context reducer
export default function contextReducer(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case ACTIONS.offline:
      return {
        ...state,
        ...{ offline: true },
      };
    case ACTIONS.online:
      return {
        ...state,
        ...{ offline: false },
      };
    case ACTIONS.bootstrap:
      return {
        ...initialState,
        ...state,
        ...action.config,
        initialized: true,
      };
    default:
      return state;
  }
}

const excludeItems = ['plugins', 'reducers', 'storage'];
// Pull plugins and reducers off intital config
export function makeContext(config) {
  return Object.keys(config).reduce((acc, current) => {
    if (excludeItems.includes(current)) {
      return acc;
    }
    acc[current] = config[current];
    return acc;
  }, {});
}
