import React from 'react';
import classNames from 'classnames';

import { IconButton } from '~meetings/ui/general';
import { useAudioLevel } from '~meetings/hooks';

function AudioIndicator({
  stream,
  className,
  label,
  onClick,
}) {
  const audioLevel = useAudioLevel(stream);

  return (
    <IconButton
      className={classNames(
        'audio-indicator',
        { [className]: className },
      )}
      icon="mic"
      label={label}
      data-cy="meetings-mute-audio-button"
      onClick={onClick}
    >
      <div
        style={{ top: `${(100 - audioLevel)}%` }}
      />
    </IconButton>
  );
}

export default AudioIndicator;
