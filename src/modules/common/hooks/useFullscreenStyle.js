import { useEffect, useRef, useState } from 'react';

/**
 *
 * @param {Boolean} fullScreen switch b/w fullscreen
 * @param {React.Ref} element ref to the element
 * @param {Number} animationDuration animation duration in ms, default 300 ms
 * @returns {Array} [initialPosition]
 */
function useFullscreenStyle(fullScreen, element, animationDuration = 300) {
  const initialPos = useRef(null);
  const scrollPos = useRef({ x: 0, y: 0 });
  const [style, setStyle] = useState({
    transitionDuration: `${animationDuration}ms`,
  });

  useEffect(() => {
    const pos = element.current.getBoundingClientRect();
    if (!fullScreen) {
      if (initialPos.current) {
        const {
          x, y, height, width,
        } = initialPos.current;
        const offsetX = x - scrollPos.current.x;
        const offsetY = y - scrollPos.current.y;
        setStyle({
          ...style,
          position: `fixed`,
          left: `${offsetX}px`,
          top: `${offsetY}px`,
          height: `${height}px`,
          width: `${width}px`,
        });
        setTimeout(() => {
          setStyle({
            ...style,
            position: `static`,
            height: `100%`,
            width: `100%`,
            left: `${offsetX}px`,
            top: `${offsetY}px`,
          });
        }, animationDuration);
      } else {
        setStyle({
          ...style,
          left: `${pos.x}px`,
          top: `${pos.y}px`,
        });
      }
    } else {
      setStyle({
        ...style,
        left: `0px`,
        top: `0px`,
        position: `fixed`,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationDuration, element, fullScreen]);

  useEffect(() => {
    const pos = element.current.getBoundingClientRect();
    initialPos.current = {
      x: pos.x,
      y: pos.y,
      height: element.current.offsetHeight,
      width: element.current.offsetWidth,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    };

    const resizeObserver = window.addEventListener('resize', () => {
      const {
        height, width, windowHeight, windowWidth,
      } = initialPos.current;
      const widthDiff = windowWidth - window.innerWidth;
      const heightDiff = windowHeight - window.innerHeight;
      initialPos.current = {
        ...initialPos.current,
        height: height - heightDiff,
        width: width - widthDiff,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      };
    });

    const scrollObserver = document.addEventListener('scroll', () => {
      const scrollOffsetY = window.scrollY;
      const scrollOffsetX = window.scrollX;
      scrollPos.current = {
        x: scrollOffsetX,
        y: scrollOffsetY,
      };
    });

    return () => {
      window.removeEventListener('resize', resizeObserver);
      window.removeEventListener('scroll', scrollObserver);
    };
  }, [element]);

  return style;
}

export default useFullscreenStyle;
