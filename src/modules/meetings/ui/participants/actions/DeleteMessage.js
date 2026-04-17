import React, { useCallback } from 'react';

import { dialog } from '@common/ui/general/Dialog';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import { Tappable } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';

function DeleteMessage({ meetingStore, message }) {
  const { meeting } = meetingStore;

  const handleDelete = useCallback(() => {
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content: 'Proceeding will delete the message. Are you sure?',
      onOk: () => message.delete(),
    });
  }, [message]);

  if (meeting && meeting.noticeBoard && meeting.isSuperHost) {
    return (
      <Tappable
        className="btn btn-small btn-inverted btn-sharp"
        onClick={handleDelete}
      >
        Delete Message
      </Tappable>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(DeleteMessage);
