import { USER_ID, USER_TRAITS } from '~analytics/utils/storage';
import ACTIONS from '~analytics/store/actions';
import Storage from '~analytics/models/storage';

// Middleware runs during ACTIONS.initialize
const initializeMiddleware = () => next => async action => {
  /* Handle bootstrap event */
  const storage = new Storage();
  if (action.type === ACTIONS.bootstrap) {
    const {
      user, persistedUser, initialUser = {},
    } = action;
    const isKnownId = persistedUser.userId === user.userId;
    /* 1. Set userId */
    if (!isKnownId && user.userId) {
      await storage.setItem(USER_ID, user.userId);
    }
    /* 2. Set traits if they are different */
    if (initialUser.traits) {
      storage.setItem(USER_TRAITS, {
        ...(isKnownId && persistedUser.traits) ? persistedUser.traits : {},
        ...initialUser.traits,
      });
    }
  }
  return next(action);
};

export default initializeMiddleware;
