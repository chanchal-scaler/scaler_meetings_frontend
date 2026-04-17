import React, { useEffect, useCallback } from 'react';
import classNames from 'classnames';
import { Observer } from 'mobx-react';

import {
  Backdrop, Icon, Tab, Tabs, Tappable, Tooltip,
} from '@common/ui/general';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { CUE_CARD_TRACKING } from '~meetings/utils/constants';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';
import analyticsOld from '~meetings/analytics';
import QuizErrors from './QuizErrors';
import QuizForm from './QuizForm';
import QuizList from './QuizList';
import QuizListSaved from './QuizListSaved';
import QuizListLaunched from './QuizListLaunched';
import QuizPreview from './QuizPreview';
import QuizSearch from './QuizSearch';
import DropDownFilter from './DropDownFilter';
import quizApi from '~meetings/api/quiz';

const modeExistingTabLabelsMap = {
  live: 'All Quizzes',
  pre: 'All Quizzes',
};

const modeMessagesMap = {
  live: 'Launch quiz for the class',
  pre: 'Create quizzes to be used during meeting',
};

const modeCreateButtonLabelsMap = {
  live: 'Save for later',
  pre: 'Create Quiz',
};

function QuizHQ({ meetingStore, quizStore: store }) {
  const dropDownFilters = [
    {
      id: 'topics',
      title: 'All Topics',
      api: quizApi.getTopics,
      placeholder: 'Search Topics...',
      handleFilterChange: store.setSelectedTopic,
      filterValue: store.selectedTopic,
    },
    {
      id: 'instructors',
      title: 'All Instructors',
      api: quizApi.getInstructors,
      placeholder: 'Search Instructors...',
      handleFilterChange: store.setSelectedInstructor,
      filterValue: store.selectedInstructor,
    },
  ];

  const mode = store.isLive ? 'live' : 'pre';
  const { meeting } = meetingStore;
  const videoBroadcasting = meeting && meeting.videoBroadcasting;
  useEffect(() => {
    // Mute screen share so that questions aren't visible to students
    if (videoBroadcasting) {
      videoBroadcasting.setMute('screen', store.isHQOpen, 'launchingQuiz');
    }
  }, [videoBroadcasting, store, store.isHQOpen]);

  useEffect(() => {
    if (store.isHQOpen && store.meta === null) {
      store.loadMeta();
    }
  }, [store, store.isHQOpen]);

  const handleCreate = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaLaunchQuizNowClick,
      click_source: DRONA_SOURCES.meetingQuizModal,
      click_feature: DRONA_FEATURES.quiz,
      click_text: 'Launch Quiz',
    });
    analyticsOld.click(CUE_CARD_TRACKING.normalQuizLaunch, 'Live Meeting', {
      meeting_name: meeting?.name,
      hosts: meeting?.namesFromAllHosts,
      meeting_date_time: meeting?.startTime,
    });
    store.create(true);
  }, [store, meeting]);

  function liveUi() {
    if (store.isLive) {
      const { manager } = meetingStore.meeting;
      return (
        <div className="mcq-hq__hint">
          <Icon className="danger m-r-5" name="eye-off" />
          <span className="hint flex-fill">
            Screen is hidden from the class
          </span>
          <Tooltip
            className="m-primary h5 no-mgn-n"
            component="a"
            onClick={() => manager.launchDummyQuiz()}
            title="Use this to get users used to the quiz interface"
          >
            Launch sample quiz
          </Tooltip>
        </div>
      );
    } else {
      return null;
    }
  }

  function headerUi() {
    return (
      <div className="layout__header mcq-hq__header">
        <div className="mcq-hq__title">
          {liveUi()}
          <h3 className="bolder dark no-mgn-b">
            {modeMessagesMap[mode]}
          </h3>
        </div>
      </div>
    );
  }

  function listTitleUi() {
    return (
      <Observer>
        {() => (
          <>
            <span>
              {modeExistingTabLabelsMap[mode]}
            </span>
          </>
        )}
      </Observer>
    );
  }

  function savedTitleUi() {
    return (
      <Observer>
        {() => (
          <>
            <span>Saved</span>
            {store.savedProblemCount > 0 && (
              <span
                className="mcq-hq__badge m-l-5"
              >
                {store.savedProblemCount}
              </span>
            )}
          </>
        )}
      </Observer>
    );
  }

  function launchedTitleUi() {
    return (
      <Observer>
        {() => (
          <>
            <span>Launched</span>
            {store.launchedProblemCount > 0 && (
              <span
                className="mcq-hq__badge m-l-5"
              >
                {store.launchedProblemCount}
              </span>
            )}
          </>
        )}
      </Observer>
    );
  }

  function createTitleUi() {
    return (
      <Observer>
        {() => (
          <Tooltip
            isDisabled={!store.editingQuiz}
            title="Cannot change tab while editing quiz"
          >
            New Quiz
          </Tooltip>
        )}
      </Observer>
    );
  }

  function tabsUi() {
    const quizCount = store.meta ? store.meta.all_problems_count : 0;

    if (store.isHQOpen) {
      return (
        <div className="layout__content">
          <Tabs
            activeTabClassName="mcq-hq__tab--active"
            activeTabName={store.activeTab}
            className="layout"
            headerClassName="mcq-hq__tabs-header"
            onChange={store.setActiveTab}
            tabClassName="mcq-hq__tab"
          >
            <Tab
              className="layout__content"
              disabled={Boolean(store.editingQuiz)}
              title={createTitleUi}
              tabName="create"
            >
              <QuizForm name={`Quiz ${quizCount + 1}`}>
                {store.isLive && (
                  <Tooltip
                    className="btn btn-primary btn-tooltip m-btn-cta m-r-10"
                    component={Tappable}
                    disabled={!store.canSubmit || store.isSubmitting}
                    isDisabled={store.canSubmit}
                    onClick={handleCreate}
                    title={<QuizErrors />}
                  >
                    Launch Quiz
                  </Tooltip>
                )}
                <Tooltip
                  className={classNames(
                    'btn btn-primary btn-tooltip',
                    { 'btn-inverted': store.isLive },
                    { 'm-btn-cta': !store.isLive },
                  )}
                  component={Tappable}
                  disabled={!store.canSubmit || store.isSubmitting}
                  isDisabled={store.canSubmit}
                  onClick={() => store.create()}
                  title={<QuizErrors />}
                >
                  {modeCreateButtonLabelsMap[mode]}
                </Tooltip>
              </QuizForm>
            </Tab>
            <Tab
              className="layout__content mcq-hq__listcontrol"
              title={listTitleUi}
              tabName="list"
            >
              <QuizSearch
                placeholder="Search by title, topic or instructor name"
              />
              <div className="mcq-hq-filter">
                {dropDownFilters.map((filter) => (
                  <DropDownFilter
                    meetingStore={meetingStore}
                    title={filter.title}
                    key={filter.title}
                    api={filter.api}
                    placeholder={filter.placeholder}
                    handleFilterChange={filter.handleFilterChange}
                    filterValue={filter.filterValue}
                  />
                ))}
              </div>
              <QuizList />
            </Tab>
            <Tab
              className="layout__content mcq-hq__listcontrol"
              title={savedTitleUi}
              tabName="saved"
            >
              <QuizListSaved />
            </Tab>
            <Tab
              className="layout__content"
              title={launchedTitleUi}
              tabName="launched"
            >
              <QuizListLaunched />
            </Tab>
          </Tabs>
        </div>
      );
    } else {
      return null;
    }
  }

  function contentUi() {
    return tabsUi();
  }

  function mainUi() {
    return (
      <div className="layout mcq-hq__main">
        {headerUi()}
        {contentUi()}
      </div>
    );
  }

  function sidebarUi() {
    if (store.isPreviewOpen) {
      return (
        <div className="mcq-hq__sidebar">
          <QuizPreview />
        </div>
      );
    } else {
      return null;
    }
  }

  return (
    <>
      <Backdrop
        isOpen={store.isHQOpen}
        onClose={() => store.setHQOpen(false)}
      />
      <div
        className={classNames(
          'mcq-hq',
          { 'mcq-hq--open': store.isHQOpen },
        )}
      >
        {mainUi()}
        {sidebarUi()}
      </div>
    </>
  );
}

export default mobxify('meetingStore', 'quizStore')(QuizHQ);
