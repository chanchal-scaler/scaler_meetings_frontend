import React, {
  createRef, useCallback, useRef,
} from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

import { logEvent } from '@common/utils/logger';
import VideoPlayer from '~video_player';

const playerControlProps = ['playbackTooltip', 'playbackRates'];

export default function ComposedVideo({
  videoSources,
  masterClassName,
  slaveClassName,
  ...remainingProps
}) {
  const [masterVideoSrc, ...slaveVideoSrcs] = videoSources;
  const slaveVideoRefs = useRef([]);
  const slaveVideoLength = useRef(slaveVideoSrcs.length);

  if (slaveVideoRefs.current.length !== slaveVideoLength.current) {
    slaveVideoRefs.current = Array(slaveVideoSrcs.length).fill().map(
      (_, index) => slaveVideoRefs[index] || createRef(),
    );
  }

  const handleEventUpdate = useCallback((event) => {
    const {
      type, target: {
        currentTime, muted, volume, playbackRate,
      },
    } = event;
    switch (type) {
      case 'play':
        slaveVideoRefs.current.forEach(videoRef => videoRef.current?.play());
        break;
      case 'pause':
        slaveVideoRefs.current.forEach(videoRef => videoRef.current?.pause());
        break;
      case 'ratechange':
        slaveVideoRefs.current.forEach(
          videoRef => videoRef.current?.setPlaybackRate(playbackRate),
        );
        break;
      case 'seeked':
        slaveVideoRefs.current.forEach(videoRef => videoRef.current?.seek(
          currentTime,
        ));
        break;
      case 'volumechange':
        if (muted) {
          slaveVideoRefs.current.forEach(videoRef => videoRef.current?.mute());
        } else {
          slaveVideoRefs.current.forEach(
            videoRef => videoRef.current?.unMute(),
          );
          slaveVideoRefs.current.forEach(
            videoRef => videoRef.current?.setVolume(volume),
          );
        }
        break;
      default:
        break;
    }
  }, []);

  const handleError = useCallback((event, data) => {
    logEvent(
      'error',
      'ComposedVideoError: Failed to play video',
      { event, data },
    );
  }, []);

  const controlProps = pick(remainingProps, playerControlProps);
  const playerProps = omit(remainingProps, playerControlProps);

  return (
    <>
      <VideoPlayer
        className={classNames({ [masterClassName]: masterClassName })}
        onPlay={handleEventUpdate}
        onPause={handleEventUpdate}
        onSeeked={handleEventUpdate}
        onRateChange={handleEventUpdate}
        onVolumeChange={handleEventUpdate}
        onError={handleError}
        src={masterVideoSrc}
        {...playerProps}
      >
        <VideoPlayer.Controls {...controlProps} />
      </VideoPlayer>
      {slaveVideoSrcs.map((slaveVideoSrc, index) => (
        <VideoPlayer
          key={`slave-video-${index}`}
          className={classNames({ [slaveClassName]: slaveClassName })}
          ref={slaveVideoRefs.current[index]}
          src={slaveVideoSrc}
          disableShortcuts
        />
      ))}

    </>
  );
}
