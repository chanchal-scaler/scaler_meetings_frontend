import {
  useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import { ResizeObserver as Polyfill } from '@juggle/resize-observer';
import debounce from 'lodash/debounce';

import { isNullOrUndefined } from '@common/utils/type';
import { useReverseInfiniteScroll } from '@common/hooks';
import ChatContext from '../context';

const ResizeObserver = window.ResizeObserver || Polyfill;

const SCROLL_THRESHOLD = 50;
const BATCH_SIZE = 50;

function useChatScroll() {
  // Used to hide the initial snap that occurs due to chat window scrolling
  // to the bottom after mounting
  const [isLoaded, setLoaded] = useState(false);
  const [height, setHeight] = useState(null);
  const {
    isAutoPlay,
    isReadingOldMessages,
    messages,
    onLoadOldMessages,
    setIsReadingOldMessages,
    setScrollTop,
  } = useContext(ChatContext);

  const {
    handleScroll: handleReverseScroll,
    list,
    renderables,
    scrollRef,
  } = useReverseInfiniteScroll({
    list: messages,
    batchSize: BATCH_SIZE,
    onAllItemsRendered: onLoadOldMessages,
  });

  const lastIndexRef = useRef(-1);

  useEffect(() => {
    function handleDimensionsChange() {
      if (scrollRef.current) {
        setHeight(scrollRef.current.offsetHeight);
      }
    }

    handleDimensionsChange();

    const resizeObserver = new ResizeObserver(handleDimensionsChange);
    resizeObserver.observe(scrollRef.current, { box: 'border-box' });

    return () => resizeObserver.disconnect();
    // eslint-disable-next-line
  }, []);

  const handleScrollThrottled = useRef(debounce((scrollEl) => {
    const currentScrollTop = scrollEl.scrollTop;
    setScrollTop(currentScrollTop);
  }, 500));

  useEffect(() => {
    setLoaded(true);
  }, []);

  // The hook that handles scroll to bottom when new message is received
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const previouslastIndex = lastIndexRef.current;
    let currentLastIndex = renderables[renderables.length - 1];
    if (isNullOrUndefined(currentLastIndex)) {
      currentLastIndex = -1;
    }

    // Ignore if no new message was added
    if (previouslastIndex === currentLastIndex) {
      return;
    }

    lastIndexRef.current = currentLastIndex;

    const lastMessage = messages[currentLastIndex];
    if (
      // Auto play condition is used in archived recordings to avoid scrolling
      // down on receiving self message
      (lastMessage && lastMessage.isMine && !isAutoPlay)
      || !isReadingOldMessages
    ) {
      // Why adding setTimeout ? MdRenderer which is used to render chat
      // messages is an async function due to this scroll happens before
      // rendering of this chat text and not calculating proper scroll height.
      // Adding 10 ms is enough because though the render function is async
      // it only takes time in the first call to load dynamic scripts.
      // Subsequent calls are resolved immediately
      setTimeout(() => {
        const maxScrollTop = scrollEl.scrollHeight - scrollEl.offsetHeight;
        scrollEl.scrollTop = maxScrollTop;
      }, 10);
    }
  }, [isAutoPlay, isReadingOldMessages, messages, renderables, scrollRef]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    if (!isReadingOldMessages) {
      const maxScrollTop = scrollEl.scrollHeight - scrollEl.offsetHeight;
      scrollEl.scrollTop = maxScrollTop;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  const handleScroll = useCallback((event) => {
    handleReverseScroll(event);

    const scrollEl = event.target;
    const currentScrollTop = scrollEl.scrollTop;
    const maxScrollTop = scrollEl.scrollHeight - scrollEl.clientHeight;

    if (maxScrollTop - currentScrollTop > SCROLL_THRESHOLD) {
      setIsReadingOldMessages(true);
    } else {
      setIsReadingOldMessages(false);
    }

    handleScrollThrottled.current(scrollEl);
  }, [handleReverseScroll, setIsReadingOldMessages]);

  return {
    handleScroll,
    isLoaded,
    messages: list,
    renderables,
    scrollRef,
  };
}

export default useChatScroll;
