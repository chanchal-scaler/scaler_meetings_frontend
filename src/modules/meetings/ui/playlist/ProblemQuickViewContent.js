import React, { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import Select from 'react-select';

import {
  ALLOWED_DURATIONS,
  DEFAULT_DURATION,
} from '~meetings/utils/quiz';
import { CUE_CARD_TRACKING } from '~meetings/utils/constants';
import { Choice } from '~meetings/ui/choices';
import { PLAYLIST_CONTENT_TYPES } from '~meetings/utils/playlist';
import { ProblemDescription } from '~meetings/ui/problem';
import { Tappable } from '@common/ui/general';
import analytics from '~meetings/analytics';
import LaunchIcon from '~meetings/images/launch-icon.svg';

function ProblemQuickViewContent({ content }) {
  const choiceUi = (choice, index) => (
    <Choice
      key={index}
      className="m-v-5"
      index={index}
      text={content.type === PLAYLIST_CONTENT_TYPES.problem
        ? choice.answer || `Option ${index + 1}`
        : choice}
      isCorrect={choice.is_correct_answer}
    />
  );

  const handleDurationUpdate = useCallback((newDuration) => {
    content.updateDuration(newDuration.value);
    const eventName = content.type === PLAYLIST_CONTENT_TYPES.problem
      ? CUE_CARD_TRACKING.quizDurationUpdate
      : CUE_CARD_TRACKING.pollDurationUpdate;
    analytics.click(eventName,
      'Live Meeting', {
        cue_card_name: content?.name,
        cue_card_order: content?.order,
        meeting_name: content?.playlist?.meeting?.name,
        hosts: content?.playlist?.meeting?.namesFromAllHosts,
        meeting_date_time: content?.playlist?.meeting?.startTime,
        updated_duration: newDuration.value,
      });
  }, [content]);

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      border: 'none',
      boxShadow: 'none',
    }),
  };

  const dynamicClass = content.type === PLAYLIST_CONTENT_TYPES.problem
    ? 'm-quick-view__launch-btn'
    : 'm-quick-view__launch-btn-poll';

  const durationUi = (runtimeDuration) => (
    <div className="mcq-form__section">
      <div className="mcq-form__section-title">
        <span>Active Duration</span>
        <span className="hint h5 normal no-mgn-b">
          (Most preferred: 30 seconds)
        </span>
      </div>
      <div className="mcq-form__section-body">
        <div className="mcq-form__field">
          <div className="mcq-form__label">
            Appears for
          </div>
          <div className="mcq-form__value">
            <Select
              className="mcq-form__select"
              name="duration"
              options={ALLOWED_DURATIONS.map(duration => ({
                value: duration,
                label: `${duration} Secs`,
              }))}
              onChange={handleDurationUpdate}
              placeholder="Select duration"
              value={{
                value: runtimeDuration || DEFAULT_DURATION,
                label: `${runtimeDuration || DEFAULT_DURATION} Secs`,
              }}
              styles={customSelectStyles}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const handleLaunchClick = async () => {
    const eventName = content.type === PLAYLIST_CONTENT_TYPES.problem
      ? CUE_CARD_TRACKING.quizCardLaunch
      : CUE_CARD_TRACKING.pollCardLaunch;
    analytics.click(eventName,
      'Live Meeting', {
        cue_card_name: content?.name,
        cue_card_order: content?.order,
        meeting_name: content?.playlist?.meeting?.name,
        hosts: content?.playlist?.meeting?.namesFromAllHosts,
        meeting_date_time: content?.playlist?.meeting?.startTime,
      });
    await content.play();
    content.setQuickViewOpen(false);
  };

  useEffect(() => {
    if (content.isQuickViewOpen) {
      const eventName = content.type === PLAYLIST_CONTENT_TYPES.problem
        ? CUE_CARD_TRACKING.quizCardQuickView
        : CUE_CARD_TRACKING.pollCardQuickView;
      analytics.view(eventName,
        'Live Meeting', {
          cue_card_name: content?.name,
          cue_card_order: content?.order,
          meeting_name: content?.playlist?.meeting?.name,
          hosts: content?.playlist?.meeting?.namesFromAllHosts,
          meeting_date_time: content?.playlist?.meeting?.startTime,
        });
    }
  }, [content]);

  return (
    <>
      <div
        className="p-20 m-quick-view__quiz-content"
      >
        <div className="m-quick-view__quiz-container">
          <ProblemDescription
            className="m-quick-view__problem-description"
            description={content.question}
          />
          <div className="hint bold">
            <span>
              {content.choices.length}
              {' '}
              options
            </span>
            {durationUi(content.duration)}
          </div>
          <div
            className="problem-preview__choices m-quick-view__choice-container"
          >
            {content.choices.map(choiceUi)}
          </div>
        </div>
        <div className="m-quick-view__launch-container">
          <Tappable
            disabled={!content.canPlay || content.isStarting}
            className={`${dynamicClass}`}
            onClick={handleLaunchClick}
          >
            <img
              className="cursor m-quick-view__launch-icon"
              src={LaunchIcon}
              alt="launch"
            />
            Launch
          </Tappable>
        </div>
      </div>
    </>
  );
}

export default observer(ProblemQuickViewContent);
