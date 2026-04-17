import React, { useCallback, useEffect } from 'react';
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
import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';
import PollErrors from './PollErrors';
import PollForm from './PollForm';
import PollList from './PollList';
import PollPreview from './PollPreview';
import PollTemplates from './PollTemplates';

const modeExistingTabLabelsMap = {
  live: 'Use from existing',
  pre: 'Existing Polls',
};

const modeMessagesMap = {
  live: 'Launch poll for the class',
  pre: 'Create polls to be used during meeting',
};

const modeCreateButtonLabelsMap = {
  live: 'Save for later',
  pre: 'Create Poll',
};

function PollHQ({ meetingStore, pollStore: store }) {
  const mode = store.isLive ? 'live' : 'pre';
  const { meeting } = meetingStore;
  const videoBroadcasting = meeting && meeting.videoBroadcasting;
  useEffect(() => {
    if (store.isHQOpen) {
      store.load(true);
    }

    // Mute screen share so that questions aren't visible to students
    if (videoBroadcasting) {
      videoBroadcasting.setMute('screen', store.isHQOpen, 'launchingPoll');
    }
  }, [videoBroadcasting, store, store.isHQOpen]);

  const handleLaunchPoll = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaLaunchPollNowClick,
      click_source: DRONA_SOURCES.meetingPollsModal,
      click_feature: DRONA_FEATURES.polls,
      click_text: 'Launch Poll',
    });
    store.create(true);
  }, [store]);

  const handleMultiplePollActions = useCallback(() => {
    store.create();
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaLaunchPollNowClick,
      click_source: DRONA_SOURCES.meetingPollsModal,
      click_feature: DRONA_FEATURES.polls,
      click_text: modeCreateButtonLabelsMap[mode],
      custom: {
        mode,
      },
    });
  }, [store, mode]);

  function liveUi() {
    if (store.isLive) {
      return (
        <div className="mcq-hq__hint">
          <Icon className="danger m-r-5" name="eye-off" />
          <span className="hint flex-fill">
            Screen is hidden from the class
          </span>
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
            {store.pollCount > 0 && (
              <span className="mcq-hq__badge m-l-5">{store.pollCount}</span>
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
            isDisabled={!store.editingPoll}
            title="Cannot change tab while editing poll"
          >
            Create New Poll
          </Tooltip>
        )}
      </Observer>
    );
  }

  function templateTileUi() {
    return (
      <Observer>
        {() => (
          <>
            <span>
              Templates
            </span>
            {store.templateCount > 0 && (
              <span className="mcq-hq__badge m-l-5">
                {store.templateCount}
              </span>
            )}
          </>
        )}
      </Observer>
    );
  }

  function tabsUi() {
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
              disabled={Boolean(store.editingPoll)}
              title={createTitleUi}
              tabName="create"
            >
              <PollForm name={`Poll ${store.pollCount + 1}`}>
                {store.isLive && (
                  <Tooltip
                    className="btn btn-primary btn-tooltip m-btn-cta m-r-10"
                    component={Tappable}
                    disabled={!store.canSubmit || store.isSubmitting}
                    isDisabled={store.canSubmit}
                    onClick={handleLaunchPoll}
                    title={<PollErrors />}
                  >
                    Launch Poll
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
                  onClick={handleMultiplePollActions}
                  title={<PollErrors />}
                >
                  {modeCreateButtonLabelsMap[mode]}
                </Tooltip>
              </PollForm>
            </Tab>
            <Tab
              className="layout__content"
              title={listTitleUi}
              tabName="list"
            >
              <PollList />
            </Tab>
            <Tab
              className="layout__content"
              title={templateTileUi}
              tabName="templates"
            >
              <PollTemplates />
            </Tab>
          </Tabs>
        </div>
      );
    } else {
      return null;
    }
  }

  function contentUi() {
    if (store.isLoaded) {
      return tabsUi();
    } else if (store.isLoading) {
      return <LoadingLayout />;
    } else if (store.loadError) {
      return (
        <HintLayout
          actionFn={() => store.load(true)}
          message="Failed to load polls"
        />
      );
    } else {
      return null;
    }
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
    if (store.isLoaded && store.isPreviewOpen) {
      return (
        <div className="mcq-hq__sidebar">
          <PollPreview />
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

export default mobxify('meetingStore', 'pollStore')(PollHQ);
