import {
  action, flow, makeObservable, observable,
} from '~meetings/shared_modules/mobx';

import { apiRequest } from '@common/api/utils';
import { logEvent } from '@common/utils/logger';

const INITIAL_LOAD_DATA_PATH = '/academy/mentee-dashboard/initial-load-data/';

class UserContextStore {
  isLoaded = false;

  isLoading = false;

  loadError = null;

  initialLoadData = null;

  userData = null;

  currentUserSlug = null;

  constructor() {
    makeObservable(this, {
      isLoaded: observable,
      isLoading: observable,
      loadError: observable.ref,
      initialLoadData: observable.ref,
      userData: observable.ref,
      currentUserSlug: observable,
      load: action.bound,
      setCurrentUserSlug: action.bound,
    });
  }

  load = flow(function* () {
    if (this.isLoading || this.isLoaded) return;

    this.isLoading = true;
    this.loadError = null;

    try {
      const json = yield apiRequest('GET', INITIAL_LOAD_DATA_PATH, null, {
        optionalAuth: true,
      });
      const userData = json?.user_data || null;

      this.initialLoadData = json || null;
      this.userData = userData;
      this.currentUserSlug = userData?.current_user?.slug || null;
      this.isLoaded = true;
    } catch (error) {
      if (error.status === 401) {
        window.location = `${window.location.protocol}//${window.location.host}/users/sign_in/`;
        return;
      }
      this.loadError = error;
      logEvent(
        'error',
        'MeetingsUserContextError: Failed to load initial user data',
        error,
      );
    }

    this.isLoading = false;
  });

  setCurrentUserSlug(slug) {
    this.currentUserSlug = slug;
  }
}

const userContextStore = new UserContextStore();

export default userContextStore;
