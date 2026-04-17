import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { isIOS } from '@common/utils/platform';
import { useMediaQuery } from '@common/hooks';

const MAX_SECONDARY_STREAMS_DEFAULT = 3;
const MAX_SECONDARY_STREAMS_RECORDING = 4;
const STREAM_ASPECT_RATIO_DEFAULT = 16 / 9;
const STREAM_ASPECT_RATIO_RECORDING = 4 / 3;

export const StreamLayoutContext = createContext({
  dimensions: {},
  numStreams: 0,
});

function useStreamLayout(position, layoutMode) {
  const { mobile } = useMediaQuery();
  const portrait = layoutMode.isPortrait;
  const { isRecording } = layoutMode;

  // change aspect ratio and max stream in case of recording,
  // to utilse maximum space
  const MAX_SECONDARY_STREAMS = isRecording
    ? MAX_SECONDARY_STREAMS_RECORDING
    : MAX_SECONDARY_STREAMS_DEFAULT;
  const STREAM_ASPECT_RATIO = isRecording
    ? STREAM_ASPECT_RATIO_RECORDING
    : STREAM_ASPECT_RATIO_DEFAULT;

  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });
  const {
    dimensions: containerDimensions,
    hasPinnedStream,
    numStreams,
  } = useContext(StreamLayoutContext);
  const { width, height } = containerDimensions;

  const smallStreamDims = useCallback(() => {
    const streamHeight = height / MAX_SECONDARY_STREAMS;
    const streamWidth = STREAM_ASPECT_RATIO * streamHeight;

    return { width: streamWidth, height: streamHeight };
  }, [MAX_SECONDARY_STREAMS, STREAM_ASPECT_RATIO, height]);

  useEffect(() => {
    if (width && height) {
      const smallDimensions = smallStreamDims();
      let newDimensions = {};
      const hasOneVisible = (
        numStreams === 1 || hasPinnedStream || mobile || portrait
      );
      if (position === 0) {
        newDimensions = {
          width: hasOneVisible ? width : width - smallDimensions.width,
          height,
          top: 0,
          left: 0,
          padding: mobile || portrait || hasPinnedStream || isRecording
            ? 0
            : '0.5rem',
        };
      } else if (!hasOneVisible && position <= MAX_SECONDARY_STREAMS) {
        newDimensions = {
          ...smallDimensions,
          top: smallDimensions.height * (position - 1),
          left: width - smallDimensions.width,
        };
      } else if (isIOS()) {
        // iOS needs special handling due to autoplay policies
        newDimensions = {
          width,
          height,
          padding: 0,
          top: 0,
          left: 0,
          opacity: 0,
          zIndex: -1,
        };
      } else {
        newDimensions = {
          width: 0,
          height: 0,
          padding: 0,
          top: height,
          left: width,
        };
      }

      setDimensions(newDimensions);
    }
  }, [
    MAX_SECONDARY_STREAMS, hasPinnedStream, height,
    isRecording, mobile, numStreams,
    portrait, position, smallStreamDims, width]);

  return dimensions;
}

export default useStreamLayout;
