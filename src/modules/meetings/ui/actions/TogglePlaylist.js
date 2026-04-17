import React from 'react';

import { CUE_CARD_TRACKING } from '~meetings/utils/constants';
import { useMediaQuery } from '@common/hooks';
import { IconButton } from '~meetings/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '~meetings/analytics';

const TogglePlaylist = ({ className, variant, meetingStore: store }) => {
  const { mobile } = useMediaQuery();
  const { meeting } = store;
  const { playlist } = meeting;

  const handleContentHideClick = () => {
    analytics.click(
      CUE_CARD_TRACKING.hideClassContent,
      'Live Meeting', {
        meeting_name: meeting?.name,
        hosts: meeting?.namesFromAllHosts,
        meeting_date_time: meeting?.startTime,
      },
    );
    playlist.setVisible(!playlist.isVisible);
  };

  if (mobile) return null;

  if (
    !playlist
    || playlist.contentList.length === 0
    || !playlist.isToggleEnabled
  ) {
    return null;
  } else if (playlist.isVisible) {
    return (
      <IconButton
        onClick={handleContentHideClick}
        className={className}
        iconClassName="m-hide-content"
        icon="class-content-active"
        label="Hide Class Content"
      >
        {variant !== 'compact' && (
          <div className="h6 m-l-5">Hide Class Content</div>
        )}
      </IconButton>
    );
  } else {
    return (
      <IconButton
        className={className}
        onClick={handleContentHideClick}
        iconClassName="m-show-content"
        icon="class-content"
        label="Show Class Content"
      >
        {variant !== 'compact' && (
          <div className="h6 m-l-5">View Class Content</div>
        )}
      </IconButton>
    );
  }
};

export default mobxify('meetingStore')(TogglePlaylist);
