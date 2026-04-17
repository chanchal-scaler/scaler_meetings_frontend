import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';

import { IconButton } from '~meetings/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { toast } from '@common/ui/general/Toast';
import { Tooltip } from '@common/ui/general';
import { toTimeUnits } from '@common/utils/date';

import analytics from '@common/utils/analytics';

function RecordingStatus({
  className,
  meetingStore: store,
  variant = 'loose',
}) {
  const [label, setLabel] = useState('Recording');
  const { meeting } = store;
  const { recording } = meeting;

  const startTime = recording && recording.startTime;

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const milliseconds = Date.now() - Date.parse(startTime);
        const units = toTimeUnits(milliseconds);
        if (units[0] === 0) {
          units.splice(0, 1);
        }
        const newLabel = units.map(o => String(o).padStart(2, '0')).join(':');
        setLabel(newLabel);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setLabel('Recording');
      return undefined;
    }
  }, [startTime]);

  const handleRecordingStart = useCallback(async () => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaRecordMeetingButtonClick,
      click_source: DRONA_SOURCES.meetingBottomPanel,
      click_feature: DRONA_FEATURES.meetingRecording,
    });
    try {
      await recording.start();
      toast.show({
        message: 'Recording started successfully',
        type: 'success',
      });
    } catch (error) {
      toast.show({
        message: 'Failed to start recording',
        type: 'error',
      });
    }
  }, [recording]);

  const handleRecordingStop = useCallback(async () => {
    try {
      await recording.stop();
      toast.show({
        message: 'Recording stopped successfully',
        type: 'success',
      });
    } catch (error) {
      toast.show({
        message: 'Failed to stop recording',
        type: 'error',
      });
    }
  }, [recording]);

  function labelUi() {
    if (variant === 'loose' && recording.isActive) {
      return (
        <span className="m-recording__label">
          {label}
        </span>
      );
    } else {
      return null;
    }
  }

  function actionUi() {
    if (recording.isControlling) {
      return (
        <IconButton
          className="danger"
          disabled={recording.isSubmitting}
          icon="dot"
          label="Stop recording"
          onClick={handleRecordingStop}
          popoverProps={{ placement: 'right', margin: { left: 5 } }}
        />
      );
    } else if (recording.canControl) {
      return (
        <IconButton
          disabled={recording.isSubmitting}
          icon="dot"
          label="Start recording"
          onClick={handleRecordingStart}
          popoverProps={{ placement: 'right', margin: { left: 5 } }}
        />
      );
    } else if (recording.isActive) {
      if (variant === 'compact') {
        return (
          <Tooltip
            className="m-recording__indicator"
            title={`Recording Active ${label}`}
          />
        );
      } else {
        return (
          <span className="m-recording__indicator" />
        );
      }
    } else {
      return null;
    }
  }

  if (recording) {
    return (
      <div
        className={classNames(
          'm-recording',
          { [className]: className },
        )}
      >
        {actionUi()}
        {labelUi()}
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(RecordingStatus);
