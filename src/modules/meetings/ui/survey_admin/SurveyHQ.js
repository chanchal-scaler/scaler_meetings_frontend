import React, { useEffect } from 'react';
import classNames from 'classnames';

import {
  Backdrop, Icon,
} from '@common/ui/general';
import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import SurveyPreview from './SurveyPreview';
import SurveyTemplates from './SurveyTemplates';

const SURVEY_MESSAGE = 'Launch survey for the class';

function SurveyHQ({ meetingStore, surveyStore: store }) {
  const { meeting } = meetingStore;
  const videoBroadcasting = meeting && meeting.videoBroadcasting;
  useEffect(() => {
    if (store.isHQOpen) {
      store.load(true);
    }

    // Mute screen share so that questions aren't visible to students
    if (videoBroadcasting) {
      videoBroadcasting.setMute('screen', store.isHQOpen, 'launchingSurvey');
    }
  }, [videoBroadcasting, store, store.isHQOpen]);

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
            {SURVEY_MESSAGE}
          </h3>
        </div>
      </div>
    );
  }

  function tabsUi() {
    if (store.isHQOpen) {
      return <SurveyTemplates />;
    }
    return null;
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
          message="Failed to load survey"
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
          <SurveyPreview />
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

export default mobxify('meetingStore', 'surveyStore')(SurveyHQ);
