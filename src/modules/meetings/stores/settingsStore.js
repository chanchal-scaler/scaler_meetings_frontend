import {
  action, makeObservable, observable,
} from 'mobx';
import forOwn from 'lodash/forOwn';

import {
  ChatNotificationLevel,
  reactionNotificationStatus,
  REACTION_MESSAGES_DICTIONARY,
} from '~meetings/utils/messaging';
import { isNullOrUndefined } from '@common/utils/type';
import LocalStorage from '@common/lib/localStorage';

const lsKey = '__dr_setting__';
const lsItemKeys = {
  notificationLevel: '__cn_level__',
  sidebarWidth: '__s_wdt__',
  reactionNotificationEnabled: '__rn_enabled__',
  rTooltipEnabled: '__rtt_enabled__',
  rTooltipOnInteraction: '__rtt_i__',
  doubtSessionTourCompleted: '__ds_tour_completed__',
  cloudProxyEnabled: '__cloud_proxy_enabled__',
};

const defaultSettings = {
  notificationLevel: ChatNotificationLevel.none,
  sidebarWidth: 320,
  rTooltipEnabled: true,
  rTooltipOnInteraction: null,
  reactionNotificationEnabled: reactionNotificationStatus.enabled,
  doubtSessionTourCompleted: false,
  cloudProxyEnabled: false,
};

class SettingsStore {
  notificationLevel = 'default';

  activeTab = '';

  isSettingsModalOpen = false;

  sidebarWidth = defaultSettings.sidebarWidth;

  reactionNotificationEnabled = defaultSettings.reactionNotificationEnabled;

  rTooltipEnabled = true;

  rTooltipOnInteraction = null;

  doubtSessionTourCompleted = defaultSettings.doubtSessionTourCompleted;

  cloudProxyEnabled = defaultSettings.cloudProxyEnabled;

  constructor() {
    makeObservable(this, {
      _initializeLS: action,
      activeTab: observable,
      cloudProxyEnabled: observable,
      doubtSessionTourCompleted: observable,
      notificationLevel: observable,
      isSettingsModalOpen: observable,
      reactionNotificationEnabled: observable,
      rTooltipEnabled: observable,
      rTooltipOnInteraction: observable,
      setActiveTab: action.bound,
      setCloudProxyEnabled: action.bound,
      setDoubtSessionTourCompleted: action.bound,
      setNotificationLevel: action.bound,
      setSettingsModalOpen: action.bound,
      setSidebarWidth: action.bound,
      setReactionNotificationEnabled: action.bound,
      setRTooltipEnabled: action.bound,
      setRTooltipOnInteraction: action.bound,
      sidebarWidth: observable,
    });
    this._initializeLS();
  }

  setActiveTab(tab) {
    this.activeTab = tab;
  }

  setCloudProxyEnabled(isEnabled) {
    this.cloudProxyEnabled = isEnabled;
    this._localStorage[lsItemKeys.cloudProxyEnabled] = isEnabled;
  }

  setDoubtSessionTourCompleted(isCompleted) {
    this.doubtSessionTourCompleted = isCompleted;
    this._localStorage[lsItemKeys.doubtSessionTourCompleted] = isCompleted;
  }

  setNotificationLevel(level) {
    this.notificationLevel = level;
    this._localStorage[lsItemKeys.notificationLevel] = level;
  }

  setSettingsModalOpen(isOpen) {
    this.isSettingsModalOpen = isOpen;
  }

  setSidebarWidth(width) {
    this.sidebarWidth = width;
    this._localStorage[lsItemKeys.sidebarWidth] = width;
  }

  setReactionNotificationEnabled(enabled) {
    this.reactionNotificationEnabled = enabled;
    this._localStorage[lsItemKeys.reactionNotificationEnabled] = enabled;
  }

  setRTooltipEnabled(flag) {
    this.rTooltipEnabled = flag;
    this._localStorage[lsItemKeys.rTooltipEnabled] = flag;
  }

  setRTooltipOnInteraction(flag) {
    this.rTooltipOnInteraction = flag;
    this._localStorage[lsItemKeys.rTooltipOnInteraction] = flag;
  }

  setRTooltipStatus(input) {
    const validInput = REACTION_MESSAGES_DICTIONARY
      .indexOf(input.trim('').toLowerCase().replace(/\s/, '')) !== -1;
    // eslint-disable-next-line max-len
    const notAckged = isNullOrUndefined(this._localStorage[lsItemKeys.rTooltipOnInteraction]);

    if (notAckged && validInput) {
      this.setRTooltipOnInteraction(true);
    }
  }

  /* Private */

  _initializeLS() {
    this._localStorage = LocalStorage.getInstance(lsKey);
    forOwn(lsItemKeys, (v, k) => {
      this[k] = isNullOrUndefined(this._localStorage[v])
        ? defaultSettings[k]
        : this._localStorage[v];
    });
  }
}

const settingsStore = new SettingsStore();

export default settingsStore;
