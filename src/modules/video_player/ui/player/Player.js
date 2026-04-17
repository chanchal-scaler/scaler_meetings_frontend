import React from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

import { forwardRef } from '@common/ui/hoc';
import Container from './Container';
import Provider from '~video_player/ui/Provider';

// List of all available event handlers
// eslint-disable-next-line
const events = [
  'onAbort', 'onCanPlay', 'onCanPlayThrough', 'onDurationChange', 'onEmptied',
  'onEncrypted', 'onEnded', 'onError', 'onLoadedData', 'onLoadedMetadata',
  'onLoadStart', 'onPause', 'onPlay', 'onPlaying', 'onProgress',
  'onRateChange', 'onSeeked', 'onSeeking', 'onStalled', 'onSuspend',
  'onTimeUpdate', 'onVolumeChange', 'onWaiting',
];

const customProps = [
  'disableShortcuts', 'onVideoChange', 'singletonsNamespace',
];

function Player({
  forwardedRef,
  containerProps = {},
  disableShortcuts = false,
  maxBufferLength = 30,
  ...remainingProps
}) {
  const rootProps = { disableShortcuts, ...pick(remainingProps, customProps) };
  const passThroughProps = { maxBufferLength, ...omit(remainingProps, customProps) };

  return (
    <Provider {...rootProps}>
      <Container
        ref={forwardedRef}
        {...passThroughProps}
      />
    </Provider>
  );
}

Player.propTypes = {
  containerProps: PropTypes.object.isRequired,
  disableShortcuts: PropTypes.bool.isRequired,
  maxBufferLength: PropTypes.number.isRequired,
  onVideoChange: PropTypes.func,
  singletonsNamespace: PropTypes.string,
  resumeAt: PropTypes.number,
  src: PropTypes.string,
};

export default forwardRef(Player);
