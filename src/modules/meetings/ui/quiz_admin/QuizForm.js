import React, { useEffect } from 'react';
import classNames from 'classnames';

import {
  ALLOWED_DURATIONS,
  MAX_DESCRIPTION_LENGTH,
} from '~meetings/utils/quiz';
import { AttentionMark } from '@common/ui/form';
import { ChoiceInput } from '~meetings/ui/choices';
import { mobxify } from '~meetings/ui/hoc';
import { Select } from '~meetings/ui/general';
import {
  Textarea,
  Timeline,
  Tooltip,
} from '@common/ui/general';
import HotKey from '@common/lib/hotKey';

function QuizForm({
  className,
  children,
  name,
  quizStore: store,
}) {
  const numChoices = store.choices.length;

  useEffect(() => {
    function handleShortcut(event) {
      const hotKey = new HotKey(event);

      hotKey.on('meta+o', store.addChoice);

      const executed = hotKey.execute();
      if (executed) {
        event.preventDefault();
      }
    }

    document.addEventListener('keydown', handleShortcut);

    return () => document.removeEventListener('keydown', handleShortcut);
  }, [store.addChoice]);

  function headerUi() {
    return (
      <div className="mcq-form__header">
        <h3 className="bold dark no-mgn-b">
          {name}
          {/* eslint-disable-next-line */}
          <a
            className="m-primary h5 normal no-mgn-b p-l-10"
            onClick={() => store.setPreviewOpen(true)}
          >
            Preview
          </a>
          <span className="m-h-5 h5 hint no-mgn-b">|</span>
          {/* eslint-disable-next-line */}
          <a
            className="m-primary h5 normal no-mgn-b"
            onClick={store.resetFields}
          >
            Reset
          </a>
        </h3>
        <div className="bold hint">
          Please complete the following details
        </div>
      </div>
    );
  }

  function descriptionUi() {
    return (
      <div className="mcq-form__section">
        <div className="mcq-form__section-title">
          Define problem statement
          <AttentionMark />
        </div>
        <div className="mcq-form__section-body relative">
          <Textarea
            className="mcq-form__description"
            minRows={3}
            maxRows={3}
            onChange={event => store.setDescription(event.target.value)}
            placeholder="Please enter the problem statement of this quiz"
            value={store.description}
          />
          <div className="mcq-form__characters">
            Character Limit:
            {' '}
            {store.description.length}
            /
            {MAX_DESCRIPTION_LENGTH}
          </div>
        </div>
      </div>
    );
  }

  function choiceUi(choice, index) {
    const isFirst = index === 0;
    const isLast = index === numChoices - 1;
    const shouldFocus = numChoices < 3 ? isFirst : isLast;

    return (
      <ChoiceInput
        key={index}
        canDelete={store.canRemoveChoice}
        className="mcq-form__choice"
        index={index}
        isCorrect={choice.is_correct_answer}
        onChange={store.setChoice}
        onDelete={store.removeChoice}
        onMarkAsCorrect={store.markChoiceAsCorrect}
        shouldFocus={shouldFocus}
        value={choice.answer}
      />
    );
  }

  function topicUi() {
    const topic = store.meta
      ? store.meta.meeting_topics : '';

    return (
      <div className="mcq-form__section">
        <div className="mcq-form__section-title">
          <span>
            Topic :
            {` ${topic}`}
          </span>
        </div>
        <div className="mcq-form__section-body">
          <span className="hint h5 normal no-mgn-b">
            (This quiz will be directly tied to the classroom topic
            for future references)
          </span>
        </div>
      </div>
    );
  }

  function optionsUi() {
    return (
      <div className="mcq-form__section">
        <div className="mcq-form__section-title">
          <span>Add options</span>
          <AttentionMark />
          <span className="hint h5 normal no-mgn-b">
            (Minimum 1 right and 1 wrong option needed)
          </span>
        </div>
        <div className="mcq-form__section-body">
          <div className="mcq-form__choices">
            {store.choices.map(choiceUi)}
          </div>
          {/* eslint-disable-next-line */}
          <Tooltip
            component="a"
            className="mcq-form__add"
            onClick={store.addChoice}
            title="CMD + O"
          >
            + Add another option
          </Tooltip>
        </div>
      </div>
    );
  }

  function durationUi() {
    return (
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
                onChange={event => store.setDuration(event.target.value)}
                optionsPlacement="top"
                value={store.duration}
              >
                {ALLOWED_DURATIONS.map((duration) => (
                  <Select.Option
                    key={duration}
                    value={duration}
                  >
                    {duration}
                    {' '}
                    Secs
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function contentUi() {
    const snoGenerator = ((function* () {
      let start = 0;
      while (true) yield start += 1;
    })());

    const getSerialNumber = () => snoGenerator.next().value;

    return (
      <div className="mcq-form__content">
        { store.meta && store.meta.meeting_topics.length > 0 && (
          <Timeline
            className="mcq-form__timeline"
            header={getSerialNumber()}
          >
            {topicUi()}
          </Timeline>
        )}
        <Timeline
          className="mcq-form__timeline"
          header={getSerialNumber()}
        >
          {descriptionUi()}
        </Timeline>
        <Timeline
          className="mcq-form__timeline"
          header={getSerialNumber()}
        >
          {optionsUi()}
        </Timeline>
        <Timeline
          className="mcq-form__timeline"
          header={getSerialNumber()}
        >
          {durationUi()}
        </Timeline>
        <Timeline
          className="mcq-form__timeline mcq-form__timeline--action"
          header={getSerialNumber()}
        >
          {children}
        </Timeline>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'mcq-form',
        { [className]: className },
      )}
    >
      {headerUi()}
      {contentUi()}
    </div>
  );
}

export default mobxify('quizStore')(QuizForm);
