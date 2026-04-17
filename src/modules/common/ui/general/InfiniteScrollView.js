import React, { useRef, useEffect } from 'react';

const InfiniteScrollView = ({ children, onEndReached, endThreshold = 10 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    function handleScroll() {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const reachedEnd = (
        scrollTop + clientHeight >= scrollHeight - endThreshold
      );
      if (reachedEnd) {
        onEndReached();
      }
    }

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [onEndReached, endThreshold]);


  return (
    <div className="infinite-scroll" ref={containerRef}>
      {children}
    </div>
  );
};

export default InfiniteScrollView;
