import React from 'react';
import PropTypes from 'prop-types';

import { meetingTypeLabel } from '~meetings/utils/meeting';
import { mobxify } from '~meetings/ui/hoc';
import Checklist from '~meetings/ui/Checklist';
import Countdown from '~meetings/ui/Countdown';
import Header from './Header';

function Upcoming({
  children,
  meetingStore: store,
  renderChecklist,
  headerActions,
}) {
  function subtitleUi() {
    switch (store.data.type) {
      case 'lecture_hall':
        return 'Lecture will begin in:';
      case 'webinar':
        return 'Masterclass will begin in:';
      default:
        return 'Meeting will commence in:';
    }
  }

  return (
    <div className="m-upcoming">
      {headerActions && (
        <Header leftActions={headerActions} className="m-upcoming__header" />
      )}
      {renderChecklist && (
        <div className="m-upcoming-checklist-container">
          <Checklist variant="dark" />
        </div>
      )}
      <div className="m-upcoming__title">
        {store.data.name}
      </div>
      <div className="m-upcoming__subtitle">
        {subtitleUi()}
      </div>
      <Countdown />
      <div className="text-c h5 m-t-10 no-mgn-b">
        You will be taken to the
        {' '}
        {meetingTypeLabel(store.data.type).toLowerCase()}
        {' '}
        as soon as the timer ends.
      </div>
      {children}
    </div>
  );
}

Upcoming.propTypes = {
  renderChecklist: PropTypes.bool,
};

export default mobxify('meetingStore')(Upcoming);
