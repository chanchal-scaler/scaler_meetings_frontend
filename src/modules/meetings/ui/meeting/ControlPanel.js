import React from 'react';
import PropTypes from 'prop-types';

import {
  EndCall,
  Fullscreen,
  MuteAudio,
  MuteVideo,
  RaiseHand,
  RotateScreen,
  ShareScreen,
  SwitchRole,
  TogglePlaylist,
} from '~meetings/ui/actions';
import { evaluateInWebview } from '@common/utils/webview';
import { useMediaQuery } from '@common/hooks';
import { JOIN_MODES } from '~meetings/utils/constants';

function ControlPanel({
  variant = 'loose',
  joiningMode = JOIN_MODES.normal,
}) {
  const { tablet } = useMediaQuery();

  return (
    <div className="control-panel">
      <div className="control-panel__actions">
        <MuteAudio className="control-panel__action" />
        <MuteVideo className="control-panel__action" />
        {
          evaluateInWebview('canRotateScreen')
            ? <RotateScreen className="control-panel__action" />
            : <Fullscreen className="control-panel__action" />
        }
        {
          joiningMode !== JOIN_MODES.companion
          && <RaiseHand className="control-panel__action" />
        }
        <SwitchRole className="control-panel__action" />
        <TogglePlaylist
          className="control-panel__action"
          variant={variant}
        />
        <ShareScreen
          className="control-panel__action"
          variant={variant}
        />
        {(tablet || variant === 'compact')
          && (
            <EndCall
              className="control-panel__action control-panel__action--end-call"
            />
          )}
      </div>
    </div>
  );
}

ControlPanel.propTypes = {
  variant: PropTypes.oneOf(['compact', 'loose']),
  joiningMode: PropTypes.oneOf(Object.values(JOIN_MODES)),
};

export default ControlPanel;
