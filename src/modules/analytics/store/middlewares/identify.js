import { analyticsStorage } from '~analytics/storage/analyticsStorage';
import { DEFINED_USER_TRAITS } from '~analytics/utils/constants';
import { tempKey, USER_ID, USER_TRAITS } from '~analytics/utils/storage';
import ACTIONS from '~analytics/store/actions';

const identifyMiddleware = store => next => async action => {
  const { userId, traits, options } = action;
  /* Reset user id and traits */
  if (action.type === ACTIONS.reset) {
    // Remove stored data
    [USER_ID, USER_TRAITS].forEach((key) => {
      // Fires async removeItem dispatch
      analyticsStorage.removeItem(key);
    });
    [
      DEFINED_USER_TRAITS.userID,
      DEFINED_USER_TRAITS.traits,
    ].forEach((key) => {
      // Remove from global context
      analyticsStorage.removeItem(tempKey(key));
    });
  }

  if (action.type === ACTIONS.identify) {
    const currentId = await analyticsStorage.getItem(USER_ID);
    const currentTraits = await analyticsStorage.getItem(USER_TRAITS) || {};

    if (currentId && (currentId !== userId)) {
      store.dispatch({
        type: ACTIONS.userIdChanged,
        old: {
          userId: currentId,
          traits: currentTraits,
        },
        new: {
          userId,
          traits,
        },
        options,
      });
    }

    /* Save user id */
    if (userId) {
      await analyticsStorage.setItem(USER_ID, userId);
    }

    /* Save user traits */
    if (traits) {
      await analyticsStorage.setItem(USER_TRAITS, {
        ...currentTraits,
        ...traits,
      });
    }
  }
  return next(action);
};

export default identifyMiddleware;
