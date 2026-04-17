import React, { useCallback } from 'react';
import classNames from 'classnames';

import { CUE_CARD_TRACKING } from '~meetings/utils/constants';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { getDaysDifference, humanizeDate } from '@common/utils/date';
import {
  Icon, Tappable, Tooltip, Chip,
} from '@common/ui/general';
import { AdvancedMdRenderer } from '@common/ui/markdown';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';
import analyticsOld from '~meetings/analytics';
import QuizForm from './QuizForm';
import QuizErrors from './QuizErrors';

function QuizTrailer({
  className,
  problem,
  quizStore: store,
}) {
  const {
    choices,
    description,
    id: problemId,
    name,
    topics,
    duration,
    created_at: createdAt,
  } = problem;

  let {
    bookmarked,
    is_launched: isLaunched,
    in_current_meeting: inCurrentMeeting,
  } = problem;
  bookmarked = Boolean(bookmarked);
  isLaunched = Boolean(isLaunched);
  inCurrentMeeting = Boolean(inCurrentMeeting);

  const handlePreview = useCallback(() => {
    store.setPreviewQuiz(problemId);
    store.setPreviewOpen(true);
  }, [problemId, store]);

  const handleClone = useCallback(() => {
    if (store.editingQuiz) {
      return;
    }
    store.cloneQuiz(problemId);
    store.setActiveTab('create');
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaEditClonedQuizClick,
      click_source: DRONA_SOURCES.meetingQuizModal,
      click_feature: DRONA_FEATURES.quiz,
      click_text: 'Clone',
    });
  }, [problemId, store]);

  const handleUpdate = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaEditClonedQuizClick,
      click_source: DRONA_SOURCES.meetingQuizModal,
      click_feature: DRONA_FEATURES.quiz,
      click_text: 'Edit',
    });
    store.setEditingQuiz(problemId);
  }, [store, problemId]);

  const handleSave = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaSaveQuizLaterClick,
      click_source: DRONA_SOURCES.meetingQuizModal,
      click_feature: DRONA_FEATURES.quiz,
      click_text: 'Save',
    });
    store.saveProblem(problemId);
  }, [problemId, store]);

  const handleUnsave = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaSaveQuizLaterClick,
      click_source: DRONA_SOURCES.meetingQuizModal,
      click_feature: DRONA_FEATURES.quiz,
      click_text: 'Unsave',
    });
    store.unsaveProblem(problemId);
  }, [problemId, store]);

  const handleInstructorClick = useCallback(() => {
    store.setSelectedInstructor(name);
  }, [store, name]);

  const handleTopicClick = useCallback((topic) => () => {
    store.setSelectedTopic(topic);
  }, [store]);

  const handleQuizLaunch = useCallback(() => {
    analyticsOld.click(CUE_CARD_TRACKING.normalQuizLaunch, 'Live Meeting', {
      class_name: className,
      problem_name: name,
      created_at: createdAt,
    });
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaLaunchClonedQuizClick,
      click_source: DRONA_SOURCES.meetingQuizModal,
      click_text: 'Launch Now',
      click_feature: DRONA_FEATURES.quiz,
    });
    store.publish(problemId);
  }, [store, problemId, className, name, createdAt]);

  const isLaunchDisabled = store.isSubmitting || isLaunched;

  function createdUi() {
    const diff = getDaysDifference(createdAt, Date.now());
    const dateString = humanizeDate(createdAt);

    if (diff === 0) {
      return `Created at ${dateString}`;
    } else if (diff < 2) {
      return `Created ${dateString}`;
    } else {
      return `Created on ${dateString}`;
    }
  }

  function headerUi() {
    return (
      <div className="mcq-trailer__header">
        <div className="mcq-trailer__title" />
        <div className="mcq-trailer__hint">
          {createdUi()}
        </div>
        <span className="m-h-5">|</span>
        {/* eslint-disable-next-line */}
        <a
          className="m-primary row flex-ac"
          onClick={handlePreview}
        >
          <Icon className="m-r-5" name="eye" />
          <span>Preview</span>
        </a>
      </div>
    );
  }

  function publishUi() {
    if (store.isLive) {
      return (
        <Tappable
          className="btn btn-danger m-btn-cta m-r-5 m-l-5"
          disabled={isLaunchDisabled}
          onClick={handleQuizLaunch}
        >
          Launch Now
        </Tappable>
      );
    } else {
      return null;
    }
  }

  function bookmarkUi() {
    const { isSaving } = store;
    if (bookmarked) {
      return (
        <Tappable
          className="btn btn-inverted btn-primary bold"
          disabled={isSaving}
          onClick={handleUnsave}
        >
          <Icon className="m-r-5" name="bookmark" />
          Unsave
        </Tappable>
      );
    } else {
      return (
        <Tappable
          className="btn btn-inverted btn-primary bold"
          disabled={isSaving}
          onClick={handleSave}
        >
          <Icon className="m-r-5" name="bookmark-outline" />
          Save
        </Tappable>
      );
    }
  }

  function editUi() {
    let handleClick = null;
    let label = '';

    if (inCurrentMeeting && !isLaunchDisabled) {
      handleClick = handleUpdate;
      label = 'Edit';
    } else {
      handleClick = handleClone;
      label = 'Clone';
    }

    return (
      <Tooltip
        className="mcq-trailer__edit-control btn
        btn-inverted btn-primary bold m-r-5"
        component={Tappable}
        disabled={Boolean(store.editingQuiz)}
        isDisabled={!store.editingQuiz}
        onClick={handleClick}
        title="Cannot perform this action while editing another quiz"
      >
        <Icon className="m-r-5" name="edit-variant" />
        {label}
      </Tooltip>
    );
  }

  function bodyUi() {
    const meetingLabelUi = () => {
      if (!inCurrentMeeting) {
        return null;
      }
      return (
        <Chip
          component="span"
          className="mcq-trailer__badge mcq-trailer__badge--just-created
          m-l-5 m-r-5"
        >
          Just created
        </Chip>
      );
    };

    let topicsArray = [];
    if (topics) {
      topicsArray = topics.split(',');
    }

    const topicChipUi = () => (
      topicsArray.map(topic => (
        <Chip
          component="span"
          className="mcq-trailer__badge cursor"
          onClick={handleTopicClick(topic)}
          key={topic}
        >
          {topic}
        </Chip>
      ))
    );

    return (
      <Tooltip
        className="mcq-trailer__body"
        component="div"
        isDisabled={!isLaunched}
        title="This quiz has already been launched"
      >
        {topicChipUi()}
        <Chip
          component="span"
          className="mcq-trailer__badge cursor"
          onClick={handleInstructorClick}
          key={name}
        >
          {name}
        </Chip>
        {meetingLabelUi()}
        <AdvancedMdRenderer
          className="dark bold"
          mdString={description}
          parseCode
          parseMathExpressions
        />
        <div className="hint bold">
          <span>
            {choices.length || 2}
            {' '}
            options
          </span>
          <span className="p-h-5">|</span>
          <span>
            Active for:
            {' '}
            {duration}
            {' '}
            seconds
          </span>
        </div>
      </Tooltip>
    );
  }

  function controlUi() {
    return (
      <div className="mcq-trailer__control">
        {publishUi()}
        <div className="mcq-trailer__control--right">
          {editUi()}
          {bookmarkUi()}
        </div>
      </div>
    );
  }

  function updateUi() {
    const totalQuizzes = store.meta.all_problems_count;
    const quizName = `Quiz-${totalQuizzes}`;

    return (
      <div
        key={problemId}
        className="mcq-hq-list__editing"
      >
        <QuizForm name={quizName}>
          <div className="row">
            <Tooltip
              className="btn btn-primary btn-tooltip m-btn-cta m-r-10"
              component={Tappable}
              disabled={!store.canSubmit || store.isSubmitting}
              isDisabled={store.canSubmit}
              onClick={() => store.update()}
              title={<QuizErrors />}
            >
              Update Quiz
            </Tooltip>
            <Tappable
              className="btn btn-primary btn-outlined"
              disabled={store.isSubmitting}
              onClick={() => store.setEditingQuiz(null)}
            >
              Cancel
            </Tappable>
          </div>
        </QuizForm>
      </div>
    );
  }

  if (store.editingQuiz && problemId === store.editingQuiz.id) {
    return updateUi();
  }

  return (
    <div
      className={classNames(
        'mcq-trailer',
        { 'mcq-trailer--disabled': isLaunched },
        { [className]: classNames },
      )}
    >
      {headerUi()}
      {bodyUi()}
      {controlUi()}
    </div>
  );
}
export default mobxify('quizStore')(QuizTrailer);
