import React, { useCallback, useEffect } from 'react';
import { VIEW_TYPES } from '@vectord/analytics';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { Icon, Tappable } from '@common/ui/general';
import { PROXY_CHAT_MODAL_STATES } from '~meetings/utils/constants';
import analytics from '@common/utils/analytics';

function CueCardPopoverContent({
  proxyChatMessage,
}) {
  const handleClosePopover = useCallback(() => {
    proxyChatMessage.setCueBasedTriggerVisible(false);
  }, [proxyChatMessage]);

  const handleTrigger = useCallback(() => {
    proxyChatMessage.toggleFormOpen(PROXY_CHAT_MODAL_STATES.cueCardBasedChat);
    handleClosePopover();

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaCueBasedChatTriggerReminderClick,
      click_source: DRONA_SOURCES.meetingProxyChatModal,
      click_feature: DRONA_FEATURES.proxyCueBasedChat,
      custom: {
        trigger: proxyChatMessage?.activeCueCardInfo?.name,
      },
    });
  }, [handleClosePopover, proxyChatMessage]);

  useEffect(() => {
    analytics.view({
      view_type: VIEW_TYPES.banner,
      view_name: DRONA_TRACKING_TYPES.dronaCueBasedChatTriggerReminderView,
      custom: {
        trigger: proxyChatMessage?.activeCueCardInfo?.name,
      },
    });
  }, [proxyChatMessage]);


  return (
    <div className="m-proxy-chat-popover__content">
      <div>
        <div className="m-proxy-chat-popover__title">
          Trigger Chat Message
        </div>
        {proxyChatMessage.activeCueCardInfo?.name && (
          <div className="m-proxy-chat-popover__sub-title">
            Trigger:
            {' '}
            {proxyChatMessage.activeCueCardInfo.name}
          </div>
        )}
      </div>
      <div className="m-proxy-chat-popover__action">
        <Tappable
          className="btn btn-primary m-proxy-chat-popover__btn"
          onClick={handleTrigger}
        >
          Trigger Now
        </Tappable>
        <Icon
          name="close"
          className="m-proxy-chat-popover__close-btn"
          onClick={handleClosePopover}
        />
      </div>
    </div>
  );
}

export default CueCardPopoverContent;
