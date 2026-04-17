import { computed, makeObservable } from 'mobx';

import TabPlugin from '~meetings/plugins/tabPlugin';
import TypeformFeedbackWithBlocker from './TypeformFeedbackWithBlocker';
import TypeformState from './typeformState';

class TypeformFeedbackTabPlugin extends TabPlugin {
  static pluginName = 'TypeformFeedbackTabPlugin';

  static Component = TypeformFeedbackWithBlocker;

  static tabName = 'typeform';

  static tabIcon = 'feedback';

  static tabLabel = 'Feedback';

  static unmountWhenHidden = false;

  _state = null;

  constructor(store, data, meeting) {
    super(store, data, meeting);

    this._state = new TypeformState(data, meeting);
    makeObservable(this, {
      badge: computed,
    });
  }

  get badge() {
    return (
      !this.state.isSubmitted
      && this.state.isUnlocked
      && 1
    );
  }

  // eslint-disable-next-line class-methods-use-this
  get badgeProps() {
    return { type: 'alert' };
  }


  get shouldAlertOnCallEnd() {
    return this.state.isUnlocked && !this.state.isSubmitted;
  }

  get state() {
    return this._state;
  }
}

export default TypeformFeedbackTabPlugin;
