import React, { useCallback, useRef, useEffect } from 'react';

import { mobxify } from '~meetings/ui/hoc';
import { Textarea } from '@common/ui/general';
import { useMediaQuery } from '@common/hooks';

function Notes({ meetingStore: store }) {
  const { meeting } = store;
  const { tablet } = useMediaQuery();
  const intervalID = useRef(null);

  useEffect(() => () => meeting.saveNotes(), [meeting]);

  const handleChange = useCallback(({ target }) => {
    meeting.setNotesInput(target.value);
    clearTimeout(intervalID.current);
    intervalID.current = setTimeout(() => {
      meeting.saveNotes();
    }, 5000);
  }, [meeting, intervalID]);

  let minRows = 10;
  let maxRows = 20;
  if (tablet) {
    minRows = 7;
    maxRows = 7;
  }

  return (
    <div className="m-notes">
      <Textarea
        className="m-notes__textarea"
        onChange={handleChange}
        placeholder="Jot down your notes here"
        minRows={minRows}
        maxRows={maxRows}
        value={meeting.notes}
      />
      <em className="hint h5 normal">
        * Your notes are autosaved
      </em>
    </div>
  );
}
export default mobxify('meetingStore')(Notes);
