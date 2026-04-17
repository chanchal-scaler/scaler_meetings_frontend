import React, { useCallback, useRef } from 'react';

import {
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { IconButton } from '~meetings/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { Popover } from '@common/ui/general';
import { PROXY_CHAT_MODAL_TO_FEATURE_MAP } from '~meetings/utils/constants';
import analytics from '@common/utils/analytics';
import CueCardPopoverContent
  from '~meetings/ui/proxy_chat/CueCardPopoverContent';

function ProxyMessage({ meetingStore }) {
  const ref = useRef();
  const { meeting } = meetingStore;

  const { proxyChatMessage } = meeting;
  const {
    isCueBasedTriggerVisible,
    modalState,
  } = proxyChatMessage || {};

  const handleProxyChatOpen = useCallback(() => {
    proxyChatMessage.toggleFormOpen();

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaProxyChatButtonClick,
      click_source: DRONA_SOURCES.meetingTopNavBar,
      click_feature: PROXY_CHAT_MODAL_TO_FEATURE_MAP[modalState],
    });
  }, [modalState, proxyChatMessage]);

  if (meeting.isSuperHost && meeting.isProxyMessageEnabled) {
    return (
      <>
        <IconButton
          ref={ref}
          className="m-header__action"
          icon="chat"
          label="Launch a custom chat"
          data-cy="meeting-proxy-chat-modal-button"
          popoverProps={{
            placement: 'bottom',
          }}
          onClick={handleProxyChatOpen}
        />
        <Popover
          isOpen={isCueBasedTriggerVisible}
          anchorRef={ref}
          placement="bottom"
          className="m-proxy-chat-popover"
          extraScope="meeting-app"
          margin={{ top: 10 }}
        >
          <CueCardPopoverContent
            proxyChatMessage={proxyChatMessage}
          />
        </Popover>
      </>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(ProxyMessage);
