import React, { useCallback, useState } from 'react';

import { dialog } from '@common/ui/general/Dialog';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { Dropdown, DropdownItem } from '@common/ui/general';
import {
  getMinutesDifferenceFromNow,
  getMinutesDifferenceToNow,
} from '@common/utils/date';
import { IconButton } from '~meetings/ui/general';
import { isFunction } from '@common/utils/type';
import { mobxify } from '~meetings/ui/hoc';
import { PluginNames } from '~meetings/plugins/utils';
import { sendSubmitGTMEvent } from '@common/utils/gtm';
import {
  SINGLETONS_NAME,
  MEETING_ACTION_TRACKING,
} from '~meetings/utils/constants';
import { toast } from '@common/ui/general/Toast';
import { useRefCallback } from '@common/hooks';
import { useWidgetData } from '~meetings/hooks';
import analytics from '@common/utils/analytics';
import EndCallPrompt from './EndCallPrompt';

const typeformTabPluginName = PluginNames.typeformFeedbackTabPlugin;
const END_FOR_ALL_VALIDATION_STRING = 'confirm';

function EndCall({
  meetingStore: store,
  pluginsStore,
  onClick,
  ...remainingProps
}) {
  const { meeting } = store;
  const { manager } = meeting;
  const [confirmString, setConfirmString] = useState('');
  const { startTime, endTime } = meeting;
  const { onEndCallRequest } = useWidgetData() || {};

  const sendEndSubmitGTMEvent = useCallback(() => {
    sendSubmitGTMEvent('call', {
      action: 'end_click', category: 'drona',
    });
  }, []);

  const shouldShowTypeformPopup = useCallback(() => {
    const plugin = pluginsStore.findPlugin(typeformTabPluginName);
    return plugin && plugin.shouldAlertOnCallEnd;
  }, [pluginsStore]);

  const handleEndButtonClick = useCallback(() => {
    if (isFunction(onClick)) {
      onClick();
    }
  }, [onClick]);

  const handleEnd = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaEndCallButtonClick,
      click_source: DRONA_SOURCES.meetingRightSideDock,
      click_text: 'Leave Meeting',
      click_feature: DRONA_FEATURES.end_call,
      custom: {
        actual_meeting_duration: getMinutesDifferenceToNow(startTime),
      },
    });
    meeting.trackEvent(MEETING_ACTION_TRACKING.dronaLeaveMeeting);
    if (isFunction(onEndCallRequest) && onEndCallRequest(meeting)) {
      return;
    }
    handleEndButtonClick();

    let data = {
      name: SINGLETONS_NAME,
      gtmData: {
        eventName: 'call',
        action: 'end',
        category: 'drona',
      },
    };
    if (shouldShowTypeformPopup()) {
      const plugin = pluginsStore.findPlugin(typeformTabPluginName);
      data = {
        ...data,
        content: 'You want to exit from the meeting without filling feedback?',
        onOk: () => {
          meeting.end();
          analytics.click({
            click_type: DRONA_TRACKING_TYPES.dronaEndCallProceedButtonClick,
            click_source: DRONA_SOURCES.meetingEndModal,
            click_text: 'Yes, Proceed',
            click_feature: DRONA_FEATURES.end_call,
            custom: {
              end_flow: 'Leave Meeting',
              actual_meeting_duration: getMinutesDifferenceToNow(startTime),
            },
          });
        },
        onCancel: () => {
          meeting.setActiveTab(plugin.tabName);
          analytics.click({
            click_type: DRONA_TRACKING_TYPES.dronaEndCallCancelButtonClick,
            click_source: DRONA_SOURCES.meetingEndModal,
            click_text: 'No, Cancel',
            click_feature: DRONA_FEATURES.end_call,
            custom: {
              end_flow: 'Leave Meeting',
              actual_meeting_duration: getMinutesDifferenceToNow(startTime),
            },
          });
        },
      };
    } else {
      data = {
        ...data,
        content: 'Proceeding will exit you from the meeting?',
        onOk: () => {
          meeting.end();
          analytics.click({
            click_type: DRONA_TRACKING_TYPES.dronaEndCallProceedButtonClick,
            click_source: DRONA_SOURCES.meetingEndModal,
            click_text: 'Yes, Proceed',
            click_feature: DRONA_FEATURES.end_call,
            custom: {
              end_flow: 'Leave Meeting',
              actual_meeting_duration: getMinutesDifferenceToNow(startTime),
            },
          });
        },
        onCancel: () => {
          analytics.click({
            click_type: DRONA_TRACKING_TYPES.dronaEndCallCancelButtonClick,
            click_source: DRONA_SOURCES.meetingEndModal,
            click_text: 'No, Cancel',
            click_feature: DRONA_FEATURES.end_call,
            custom: {
              end_flow: 'Leave Meeting',
              actual_meeting_duration: getMinutesDifferenceToNow(startTime),
            },
          });
        },
      };
    }
    sendEndSubmitGTMEvent();
    dialog.areYouSure(data);
  }, [handleEndButtonClick, onEndCallRequest, meeting,
    pluginsStore, sendEndSubmitGTMEvent, shouldShowTypeformPopup,
    startTime]);

  const handleEndForAll = useCallback(() => {
    handleEndButtonClick();

    let data = { name: SINGLETONS_NAME };
    if (shouldShowTypeformPopup()) {
      const plugin = pluginsStore.findPlugin(typeformTabPluginName);
      data = {
        ...data,
        content: 'You want to end meeting for everyone without filling '
          + 'feedback?',
        onOk: () => {
          manager.endMeetingForAll();
          analytics.click({
            click_type: DRONA_TRACKING_TYPES.dronaEndCallProceedButtonClick,
            click_source: DRONA_SOURCES.meetingEndModal,
            click_text: 'Yes, Proceed',
            click_feature: DRONA_FEATURES.end_call,
            custom: {
              end_flow: 'End for All',
              actual_meeting_duration: getMinutesDifferenceToNow(startTime),
            },
          });
        },
        onCancel: () => {
          meeting.setActiveTab(plugin.tabName);
          analytics.click({
            click_type: DRONA_TRACKING_TYPES.dronaEndCallCancelButtonClick,
            click_source: DRONA_SOURCES.meetingEndModal,
            click_text: 'No, Cancel',
            click_feature: DRONA_FEATURES.end_call,
            custom: {
              end_flow: 'End for All',
              actual_meeting_duration: getMinutesDifferenceToNow(startTime),
            },
          });
        },
      };
    } else {
      data = {
        ...data,
        content: 'Proceeding will end this meeting for everyone?',
        onOk: () => {
          manager.endMeetingForAll();
          analytics.click({
            click_type: DRONA_TRACKING_TYPES.dronaEndCallProceedButtonClick,
            click_source: DRONA_SOURCES.meetingEndModal,
            click_text: 'Yes, Proceed',
            click_feature: DRONA_FEATURES.end_call,
            custom: {
              end_flow: 'End for All',
              actual_meeting_duration: getMinutesDifferenceToNow(startTime),
            },
          });
        },
        onCancel: () => {
          analytics.click({
            click_type: DRONA_TRACKING_TYPES.dronaEndCallProceedButtonClick,
            click_source: DRONA_SOURCES.meetingEndModal,
            click_text: 'No, Cancel',
            click_feature: DRONA_FEATURES.end_call,
            custom: {
              end_flow: 'End for All',
              actual_meeting_duration: getMinutesDifferenceToNow(startTime),
            },
          });
        },
      };
    }
    dialog.areYouSure(data);
  }, [
    handleEndButtonClick, manager, meeting,
    pluginsStore, shouldShowTypeformPopup,
    startTime,
  ]);


  const validateInputForEndAll = useCallback(() => {
    if (confirmString === END_FOR_ALL_VALIDATION_STRING) {
      manager.endMeetingForAll();
    } else {
      toast.show(
        { message: 'Please enter the confirmation correctly!', type: 'error' },
      );
    }
  }, [confirmString, manager]);

  const validateInputForEndAllRef = useRefCallback(validateInputForEndAll);

  const confirmEndForAll = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaEndCallButtonClick,
      click_source: DRONA_SOURCES.meetingRightSideDock,
      click_feature: DRONA_FEATURES.end_call,
      click_text: 'End Meeting for All',
      custom: {
        actual_meeting_duration: getMinutesDifferenceToNow(startTime),
      },
    });
    if (getMinutesDifferenceFromNow(endTime) <= 0) {
      handleEndForAll();
    } else {
      dialog.areYouSure({
        name: SINGLETONS_NAME,
        onOk: validateInputForEndAllRef,
        content: <EndCallPrompt
          setConfirmString={setConfirmString}
        />,
      });
    }
  }, [endTime, validateInputForEndAllRef, setConfirmString, handleEndForAll,
    startTime]);

  if (meeting.isSuperHost) {
    return (
      <Dropdown
        component={IconButton}
        icon="call-end"
        label="End Call"
        data-cy="meetings-end-call-button"
        popoverProps={{
          className: 'm-dropdown',
          extraScope: 'meeting-app',
          location: { bottom: '120%', right: 0 },
        }}
        type="danger"
        {...remainingProps}
      >
        <DropdownItem
          className="btn btn-danger"
          onClick={confirmEndForAll}
          data-cy="meetings-end-call-for-all-button"
        >
          End Meeting for All
        </DropdownItem>
        <DropdownItem
          className="btn"
          onClick={handleEnd}
          data-cy="meetings-leave-button"
        >
          Leave Meeting
        </DropdownItem>
      </Dropdown>
    );
  } else {
    return (
      <IconButton
        icon="call-end"
        label="End Call"
        data-cy="meetings-end-call-button"
        onClick={handleEnd}
        type="danger"
        {...remainingProps}
      />
    );
  }
}

export default mobxify('meetingStore', 'pluginsStore')(EndCall);
