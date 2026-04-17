import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import compose from 'lodash/fp/compose';

import { AddBookmarkModal } from '~meetings/ui/bookmarks';
import { CreatePlaybackModal } from '~meetings/ui/playback';
import { mobxify, withJoinedMeeting } from '~meetings/ui/hoc';
import { useQuery } from '@common/hooks';
import { Watermark } from '~meetings/ui/general';

function LiveContainer({
  children,
  className,
  meetingStore: store,
  renderSingletons,
  ...remainingProps
}) {
  const { meeting } = store;
  const { godMode } = useQuery();

  useEffect(() => {
    if (meeting.isSuperHost && godMode === '1') {
      meeting.setGodMode(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        className={classNames('meeting', { [className]: className })}
        {...remainingProps}
      >
        {children()}
      </div>
      {renderSingletons && (
        <>
          <Watermark userId={meeting.userId} />
          <AddBookmarkModal />
          {meeting.playback && <CreatePlaybackModal />}
        </>
      )}
    </>
  );
}

LiveContainer.propTypes = {
  renderSingletons: PropTypes.bool,
};

const hoc = compose(
  withJoinedMeeting,
  mobxify('meetingStore'),
);

export default hoc(LiveContainer);
