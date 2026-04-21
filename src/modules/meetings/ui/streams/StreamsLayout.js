import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { ResizeObserver as Polyfill } from '@juggle/resize-observer';

import { mobxify } from '~meetings/ui/hoc';
import { StreamLayoutContext } from '~meetings/hooks/useStreamLayout';

const ResizeObserver = window.ResizeObserver || Polyfill;

function StreamsLayout({
  className,
  hasPinnedStream,
  numStreams,
  layoutStore,
  ...remainingProps
}) {
  const ref = useRef(null);
  const [dimensions, setDimensions] = useState({});
  const { isRecording } = layoutStore;

  const handleDimensionsChange = useCallback(() => {
    if (ref.current) {
      const newDimensions = {
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight,
      };

      setDimensions(newDimensions);
    }
  }, []);

  useEffect(() => {
    handleDimensionsChange();

    const resizeObserver = new ResizeObserver(handleDimensionsChange);
    resizeObserver.observe(ref.current, { box: 'border-box' });

    return () => resizeObserver.disconnect();
    // eslint-disable-next-line
  }, []);

  return (
    <StreamLayoutContext.Provider
      value={{
        dimensions,
        numStreams,
        hasPinnedStream,
      }}
    >
      <div
        ref={ref}
        className={classNames(
          'streams-layout',
          { 'streams-layout--pinned': hasPinnedStream },
          { 'streams-layout--recording': isRecording },
          { [className]: className },
        )}
        {...remainingProps}
      />
    </StreamLayoutContext.Provider>
  );
}

export default mobxify('layoutStore')(StreamsLayout);
