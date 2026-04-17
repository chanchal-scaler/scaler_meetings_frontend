import React, { useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';

import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import { Icon, Tappable, Tooltip } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import MeetingFormModal from './MeetingFormModal';
import MeetingItem from './MeetingItem';

function HomePage({ homeStore: store }) {
  useEffect(() => {
    store.load();
    // eslint-disable-next-line
  }, []);

  const handleCreate = useCallback(() => {
    store.setCreateModalOpen(true);
  }, [store]);

  function listUi() {
    if (store.meetings.length > 0) {
      return store.meetings.map(meeting => (
        <MeetingItem
          key={meeting.slug}
          meeting={meeting}
        />
      ));
    } else {
      return (
        <HintLayout
          actionLabel="Create Meeting"
          actionFn={handleCreate}
          className="m-home__hint"
          isFit
          isTransparent
          message="No meetings"
        />
      );
    }
  }

  function headerUi() {
    return (
      <div className="m-header">
        <div className="m-header__title">
          Meetings
        </div>
      </div>
    );
  }

  function ui() {
    if (store.isForbidden) {
      return <Navigate to="/404" />;
    } else if (store.isLoading) {
      return <LoadingLayout isTransparent />;
    } else if (store.loadError) {
      return (
        <HintLayout
          isTransparent
          message="Failed to load meetings"
          actionLabel="Try again"
          actionFn={() => store.load()}
        />
      );
    } else if (store.isLoaded) {
      return (
        <>
          <div className="m-home__main">
            <div className="m-home__list">
              {listUi()}
            </div>
            {store.meetings.length > 0 && (
              <Tooltip
                className="
                  btn btn-large btn-icon btn-round
                  btn-primary m-home__action
                "
                component={Tappable}
                onClick={handleCreate}
                title="Create new meeting"
              >
                <Icon name="add" />
              </Tooltip>
            )}
          </div>
          <MeetingFormModal />
        </>
      );
    } else {
      return null;
    }
  }

  return (
    <div className="layout m-home">
      {headerUi()}
      <div className="layout__content m-home__content">
        {ui()}
      </div>
    </div>
  );
}

export default mobxify('homeStore')(HomePage);
