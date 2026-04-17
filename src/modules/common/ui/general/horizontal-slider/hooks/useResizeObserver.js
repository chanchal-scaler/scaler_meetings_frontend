import { useEffect, useState } from 'react';

function useResizeObserver(ref) {
  const [widthConfig, setWidthConfig] = useState({});

  useEffect(() => {
    const target = ref?.current;
    const resizeObserver = target && new ResizeObserver((entries) => {
      const entry = entries[0];
      setWidthConfig({
        totalWidth: entry.target.offsetWidth,
        visibleWidth: entry.target.parentNode.offsetWidth,
        childWidth: entry.target.firstChild.offsetWidth,
        margin: entry.target.childNodes[1].offsetLeft
          - (entry.target.childNodes[0].offsetLeft
          + entry.target.childNodes[0].offsetWidth),
      });
    });
    resizeObserver?.observe(target);

    return () => {
      if (resizeObserver && target) {
        resizeObserver.unobserve(target);
      }
    };
  }, [ref]);

  return widthConfig;
}

export default useResizeObserver;
