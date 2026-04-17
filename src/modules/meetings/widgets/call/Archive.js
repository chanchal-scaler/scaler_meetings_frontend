import React from 'react';

import { mobxify } from '~meetings/ui/hoc';
import { Playlist, WithArchive } from '~meetings/components/modes/archive';

function Archive() {
  return (
    <WithArchive>
      {() => <Playlist />}
    </WithArchive>
  );
}

export default mobxify('meetingStore')(Archive);
