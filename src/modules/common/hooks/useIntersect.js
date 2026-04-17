import {
  useEffect, useMemo, useRef, useState,
} from 'react';

export default ({ root = null, rootMargin = '0px', threshold = 0 }) => {
  const [entry, updateEntry] = useState({});
  const ref = useRef(null);
  const observer = useMemo(() => new window.IntersectionObserver(
    ([e]) => updateEntry(e), {
      root,
      rootMargin,
      threshold,
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [root]);

  useEffect(
    () => {
      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    },
    [ref, observer],
  );

  return [ref, entry];
};
