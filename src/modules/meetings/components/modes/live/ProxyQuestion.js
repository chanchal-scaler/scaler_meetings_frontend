import React, { useCallback } from 'react';

import {
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { IconButton } from '~meetings/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { PROXY_QUESTION_MODAL_TO_FEATURE_MAP } from '~meetings/utils/constants';
import analytics from '@common/utils/analytics';

function ProxyQuestion({ meetingStore }) {
  const { meeting } = meetingStore;

  const { proxyQuestion } = meeting;
  const {
    modalState,
  } = proxyQuestion || {};

  const handleProxyQuestionOpen = useCallback(() => {
    proxyQuestion.toggleFormOpen();

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaProxyQuestionButtonClick,
      click_source: DRONA_SOURCES.meetingTopNavBar,
      click_feature: PROXY_QUESTION_MODAL_TO_FEATURE_MAP[modalState],
    });
  }, [modalState, proxyQuestion]);

  if (meeting.isSuperHost && meeting.isProxyMessageEnabled) {
    return (
      <IconButton
        className="m-header__action"
        icon="question"
        label="Launch a custom question"
        onClick={handleProxyQuestionOpen}
      />
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(ProxyQuestion);
