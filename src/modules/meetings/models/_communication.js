import {
  action, computed, makeObservable, observable,
} from 'mobx';

import { NotImplementedError } from '@common/errors';
import { PROVIDERS } from '~meetings/utils/constants';
import { ServiceProviderError } from '~meetings/errors';

class _Communication {
  isLoaded = false;

  isLoading = false;

  isJoined = false;

  isJoining = false;

  loadError = null;

  constructor(meeting, provider, token) {
    this._meeting = meeting;
    this._provider = provider;
    this._token = token;
    this._createClient();
    makeObservable(this, {
      _client: observable.ref,
      _createAgoraClient: action,
      client: computed,
      isLoaded: observable,
      isLoading: observable,
      loadError: observable.ref,
    });
  }

  /* Public methods/getters */

  get channelName() {
    return String(this.meeting.id);
  }

  get client() {
    return this._client;
  }

  get manager() {
    return this.meeting.manager;
  }

  get meeting() {
    return this._meeting;
  }

  get provider() {
    return this._provider;
  }

  get providerKeys() {
    return this._providerKeys;
  }

  get role() {
    return this.meeting.selectedRole;
  }

  get slug() {
    return this.meeting.slug;
  }

  get token() {
    return this._token;
  }

  get user() {
    return this.meeting.user;
  }

  get userId() {
    return String(this.user.user_id);
  }

  /* Private methods/getters */

  initialise() {
    if (
      this.isJoined
      || this.isJoining
    ) return false;

    return true;
  }

  _createClient() {
    this._loadProviderKeys();
    switch (this.provider) {
      case PROVIDERS.Agora:
        this._createAgoraClient();
        break;
      default:
        throw new ServiceProviderError(
          'INVALID_SERVICE_PROVIDER',
          this.provider,
        );
    }
  }

  // eslint-disable-next-line
  _createAgoraClient() {
    throw new NotImplementedError('_createAgoraClient');
  }

  _loadProviderKeys() {
    const providerKeys = window.__MEETING_CONFIG__
      ?.providers
      ?.[this.provider];

    this._providerKeys = providerKeys || {};
  }
}

export default _Communication;
