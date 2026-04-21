import React, {
  useCallback, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { ControlPanel, RecordingStatus } from '~meetings/ui/meeting';
import { DRONA_SOURCES } from '~meetings/utils/trackingEvents';
import { mobxify } from '~meetings/ui/hoc';
import { SettingsToggle } from '~meetings/ui/actions';
import { useMediaQuery } from '@common/hooks';

function Footer({ meetingStore: store, variant = 'loose' }) {
  const { tablet } = useMediaQuery();
  const timerRef = useRef(null);

  const { meeting } = store;
  const { videoBroadcasting } = meeting;
  const shouldCollapse = (
    (videoBroadcasting && videoBroadcasting.hasPinnedStream)
    || variant === 'compact'
  );

  useEffect(() => {
    if (shouldCollapse) {
      timerRef.current = setTimeout(() => {
        meeting.setControlsVisible(false);
      }, 1000);
    } else {
      meeting.setControlsVisible(true);
    }

    return () => clearTimeout(timerRef.current);
  }, [meeting, shouldCollapse]);

  const handleMouseMove = useCallback((event) => {
    event.stopPropagation();

    meeting.setControlsVisible(true, false);
  }, [meeting]);

  const handleMouseLeave = useCallback(() => {
    meeting.setControlsVisible(true);
  }, [meeting]);

  return (
    <div
      className={classNames(
        'm-footer',
        { 'm-footer--can-collapse': shouldCollapse },
        {
          'm-footer--collapsed':
            shouldCollapse && !meeting.areControlsVisible,
        },
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="m-footer__main">
        <ControlPanel
          variant={variant}
          joiningMode={meeting.joiningMode}
        />
      </div>
      <div className="m-footer__side m-footer__side--left">
        {!tablet && (
          <RecordingStatus variant={variant} className="m-l-10" />
        )}
      </div>
      <div className="m-footer__side m-footer__side--right">
        {variant === 'compact' && (
          <SettingsToggle
            className="m-l-5"
            source={DRONA_SOURCES.meetingFooter}
          />
        )}
      </div>
    </div>
  );
}

Footer.propTypes = {
  variant: PropTypes.oneOf(['compact', 'loose']),
};

export default mobxify('meetingStore')(Footer);
