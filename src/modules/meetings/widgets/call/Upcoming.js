import React, { useState } from 'react';
import classNames from 'classnames';

import { Icon, Tappable } from '@common/ui/general';
import { IconButton } from '~meetings/ui/general';
import {
  Upcoming as UpcomingContent,
} from '~meetings/components/modes/upcoming';
import Checklist from '~meetings/ui/Checklist';

function Upcoming() {
  const [isChecklistOpen, setChecklistOpen] = useState(false);

  return (
    <>
      <div
        className={classNames(
          'mw-upcoming',
          { 'mw-upcoming--blurred': isChecklistOpen },
        )}
      >
        <UpcomingContent />
        <IconButton
          className="mw-upcoming__checklist-btn"
          icon="unordered-list"
          onClick={() => setChecklistOpen(true)}
        >
          <span className="h4 no-mgn-b m-l-5">
            Checklist
          </span>
        </IconButton>
      </div>
      {isChecklistOpen && (
        <div className="mw-upcoming-checklist">
          <Tappable
            className="
              btn btn-light btn-large btn-icon
              mw-upcoming-checklist__close
            "
            onClick={() => setChecklistOpen(false)}
          >
            <Icon name="clear" />
          </Tappable>
          <Checklist variant="dark" />
        </div>
      )}
    </>
  );
}

export default Upcoming;
