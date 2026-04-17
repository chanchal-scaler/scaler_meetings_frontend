import React, { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Widget as TypeformWidget } from '@typeform/embed-react';

import { CountDown, Icon, Modal } from '@common/ui/general';
import { HintLayout } from '@common/ui/layouts';
import { PluginNames } from '~meetings/plugins/utils';
import { useUnmountedRef } from '@common/hooks';
import MeetingEvents from '~meetings/events';

function TypeformFeedbackWithBlocker({ plugin }) {
  const unmountedRef = useUnmountedRef();
  const { state } = plugin;

  // If when user joins meeting and he did not yet submit feedback, we would
  // want to open this by default. This effect handles logic for it.
  useEffect(() => {
    if (!state.isSubmitted && state.isUnlocked) {
      plugin.meeting.setActiveTab(plugin.tabName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const adiosPlugin = plugin.store.findPlugin(
      PluginNames.typeformFeedbackAdiosPlugin,
    );
    if (adiosPlugin && state.isUnlocked) {
      adiosPlugin.markUnlockedInSession();
    }
  }, [plugin.store, state.isUnlocked]);

  const handleSubmit = useCallback(() => {
    // Typeform library fires the callback even if component is unmounted
    // which is not desired in this case. The below check make's sure to
    // execute the callback only when the component is mounted
    if (unmountedRef.current) {
      return;
    }

    state.markSubmitted();
    const adiosPlugin = plugin.store.findPlugin(
      PluginNames.typeformFeedbackAdiosPlugin,
    );
    if (adiosPlugin) {
      adiosPlugin.markFilledInSession();
    }
    plugin.meeting.track('drona-typeform-submitted-during-meet');
    plugin.meeting.dispatchEvent(MeetingEvents.TYPEFORM_FEEDBACK_SUBMITTED);
  }, [plugin.meeting, plugin.store, state, unmountedRef]);

  useEffect(() => {
    if (state.isSubmitted || !state.isUnlocked) return undefined;

    function handleUnload(event) {
      if (!state.isSubmitted) {
        event.preventDefault();
        const prompt = 'You sure you want to leave without filling feedback?';
        // eslint-disable-next-line no-param-reassign
        event.returnValue = prompt; // For legacy browser support
        return prompt;
      } else {
        return undefined;
      }
    }

    window.addEventListener('beforeunload', handleUnload);

    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [state.isSubmitted, state.isUnlocked]);

  const blockerModalUi = () => (
    <Modal
      canClose={false}
      className="typeform-feedback__blocker"
      hasBackdrop
      isOpen
      withoutHeader
      hasCloseButton={false}
      isAbsolute
    >
      <div className="typeform-feedback__modal">
        <div className="typeform-feedback__modal-header">
          <Icon
            name="feedback"
            className="typeform-feedback__modal-icon"
          />
        </div>
        <div className="typeform-feedback__modal-title bold m-b-20 text-center">
          <h3>
            Provide feedback for this session in
          </h3>
        </div>
        <div className="typeform-feedback__modal-body">
          <div
            className="typeform-feedback__modal-button"
          >
            <CountDown
              className="typeform-feedback__modal-timer"
              time={String(state.unlocksOn)}
              format={CountDown.STYLEABLE_TIMER}
            />
          </div>
        </div>
        <div className="hint normal h5 text-center m-v-20">
          Wish to give feedback right now?
          {' '}
          No problem, you'll be able to access the
          {' '}
          feedback form in a while
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="typeform-feedback">
      {state.isSubmitted
        ? (
          <HintLayout
            message="Thank you for filling the feedback form!"
            className="bold ph-20"
          />
        )
        : (
          <TypeformWidget
            id={state.formId}
            className="typeform-feedback__form-full"
            onSubmit={handleSubmit}
            hidden={state.hiddenFields}
          />
        )}
      {!state.isUnlocked && blockerModalUi()}
    </div>
  );
}

export default observer(TypeformFeedbackWithBlocker);
