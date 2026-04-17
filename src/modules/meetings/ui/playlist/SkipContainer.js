import React from 'react';

import { mobxify } from '~meetings/ui/hoc';
import AlertIcon from '~meetings/images/alert-triangle.svg';


function SkipContainer({ meetingStore: store }) {
  const { meeting } = store;
  const { playlist } = meeting;

  if (playlist.skipCount === 0) {
    return null;
  }

  return (
    <div className="m-skip-container">
      <img
        className="m-skip-container__alert-icon"
        src={AlertIcon}
        alt="skip"
      />
      <span className="m-skip-container__skip-count">{playlist.skipCount}</span>
    </div>
  );
}

export default mobxify('meetingStore')(SkipContainer);
