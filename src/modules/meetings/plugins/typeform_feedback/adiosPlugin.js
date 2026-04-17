import React, { useCallback } from 'react';
import { Widget as TypeformWidget } from '@typeform/embed-react';

import { PluginNames } from '~meetings/plugins/utils';
import AdiosPlugin from '~meetings/plugins/adiosPlugin';
import MeetingEvents from '~meetings/events';
import TypeformState from './typeformState';

function TypeformFeedback({ plugin }) {
  const { state } = plugin;

  const handleSubmit = useCallback(() => {
    state.markSubmitted();
    plugin.meeting.track('drona-typeform-submitted-at-end');
    plugin.meeting.dispatchEvent(MeetingEvents.TYPEFORM_FEEDBACK_SUBMITTED);
  }, [plugin.meeting, state]);

  return (
    <div className="typeform-feedback typeform-feedback--compact">
      <TypeformWidget
        id={state.formId}
        className="typeform-feedback__form-full"
        onSubmit={handleSubmit}
        hidden={state.hiddenFields}
      />
    </div>
  );
}

class TypeformFeedbackAdiosPlugin extends AdiosPlugin {
  static pluginName = PluginNames.typeformFeedbackAdiosPlugin;

  static Component = TypeformFeedback;

  _state = null;

  constructor(store, data, meeting) {
    super(store, data, meeting);

    this._state = new TypeformState(data, meeting);
    this._filledInSession = this.state.isSubmitted;
    this._unlockedInSession = this.state.isUnlocked;
  }

  markFilledInSession() {
    this._filledInSession = true;
  }

  markUnlockedInSession() {
    this._unlockedInSession = true;
  }

  get isDisabled() {
    return this._filledInSession || !this._unlockedInSession;
  }

  get state() {
    return this._state;
  }
}

export default TypeformFeedbackAdiosPlugin;
