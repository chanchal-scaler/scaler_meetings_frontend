import { analyticsStorage } from '~analytics/storage/analyticsStorage';
import { USER_ID, USER_TRAITS } from '~analytics/utils/storage';
import ACTIONS from '~analytics/store/actions';

const initialState = {
  userId: null,
  traits: {},
};

/* user reducer */
export default function (state = initialState, action = {}) {
  switch (action.type) {
    case ACTIONS.identify:
      return {
        ...state,
        userId: action.userId,
        traits: {
          ...state.traits,
          ...action.traits,
        },
      };
    case ACTIONS.reset:
      [USER_ID, USER_TRAITS].forEach((key) => {
        analyticsStorage.removeItem(key);
      });
      return {
        ...state,
        userId: null,
        traits: {},
      };
    default:
      return state;
  }
}
