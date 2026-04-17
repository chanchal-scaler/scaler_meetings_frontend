import React from 'react';
import { observer } from 'mobx-react';

import { CUE_CARD_TRACKING } from '~meetings/utils/constants';
import { useComponentViewedTracking } from '@common/hooks';
import analytics from '~meetings/analytics';
import CueCardContent from './cue_card/CueCardContent';

function CueCardQuickViewContent({ content }) {
  const ref = useComponentViewedTracking({
    analytics,
    eventName: CUE_CARD_TRACKING.cueCardQuickViewPopup,
    source: 'Live Meeting',
    payload: {
      cue_card_name: content?.name,
      cue_card_order: content?.order,
      meeting_name: content?.playlist?.meeting?.name,
      hosts: content?.playlist?.meeting?.namesFromAllHosts,
      meeting_date_time: content?.playlist?.meeting?.startTime,
    },
  });

  return (
    <div
      className="p-20 m-quick-view__content"
      ref={ref}
    >
      <CueCardContent content={content} />
    </div>
  );
}

export default observer(CueCardQuickViewContent);
