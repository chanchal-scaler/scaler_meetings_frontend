import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import takeRight from 'lodash/takeRight';
import times from 'lodash/times';
import uniq from 'lodash/uniq';

import { isNullOrUndefined } from '@common/utils/type';

const SCROLL_TOP_OFFSET = 50;

function getBatch(offset, size) {
  const batch = [];
  const end = Math.max(0, offset - size);
  for (let i = offset - 1; i >= end; i -= 1) {
    batch.unshift(i);
  }
  return batch;
}

function useReverseInfiniteScroll({
  list,
  batchSize,
  maxRenderablesCount = 3 * batchSize,
  initialScrollBottom = 0,
  onAllItemsRendered,
}) {
  const ref = useRef(null);
  const lockRef = useRef(false);
  const [forceRender, setForceRender] = useState(false);
  const [internalList, setInternalList] = useState(list);
  const [renderables, setRenderables] = useState(
    getBatch(list.length, batchSize),
  );
  const [scrollBottom, setScrollBottom] = useState(initialScrollBottom);

  const hasMore = useCallback(() => {
    if (internalList.length === 0) {
      return false;
    }

    if (renderables[0] === 0) {
      return false;
    }

    return true;
  }, [internalList.length, renderables]);

  const handleNextBatch = useCallback(() => {
    const scrollEl = ref.current;
    const { scrollTop } = scrollEl;
    lockRef.current = true;

    // Store the current scrollBottom
    const maxScrollTop = scrollEl.scrollHeight - scrollEl.offsetHeight;
    const newScrollBottom = maxScrollTop - scrollTop;
    setScrollBottom(newScrollBottom);

    // Calculate new items to be rendered
    const newBatch = getBatch(renderables[0], batchSize);
    const newRenderables = uniq([...newBatch, ...renderables]);
    setRenderables(newRenderables);
  }, [batchSize, renderables]);

  const handleScroll = useCallback(() => {
    const scrollEl = ref.current;
    const { scrollTop } = scrollEl;
    if (!lockRef.current && scrollTop <= SCROLL_TOP_OFFSET) {
      if (hasMore()) {
        handleNextBatch();
      } else if (onAllItemsRendered) {
        onAllItemsRendered();
      }
    }
  }, [handleNextBatch, hasMore, onAllItemsRendered]);

  useEffect(() => {
    if (ref.current) {
      const scrollEl = ref.current;
      const maxScrollTop = scrollEl.scrollHeight - scrollEl.offsetHeight;
      scrollEl.scrollTop = maxScrollTop - scrollBottom;
    }
  }, [scrollBottom]);

  // When more items are added/removed from the list
  useEffect(() => {
    // Checking length before accessing 0th index to avoid warnings when using
    // mobx
    const currFirstMessage = list.length > 0 ? list[0] : undefined;
    const prevFirstMessage = internalList.length > 0
      ? internalList[0]
      : undefined;
    const areMessagesAddedToStart = (
      currFirstMessage
      && prevFirstMessage
      && currFirstMessage.uid !== prevFirstMessage.uid
    );

    // If new messages added to the beginning then render them
    // by default for better UX
    if (areMessagesAddedToStart) {
      setForceRender(true);
    }

    setRenderables(prevRenderables => {
      let boundaryIndex = prevRenderables[prevRenderables.length - 1];
      if (isNullOrUndefined(boundaryIndex)) {
        boundaryIndex = -1;
      }

      const newItemCount = list.length - boundaryIndex - 1;

      // No messages added or removed so nothing to do
      if (newItemCount === 0) {
        return prevRenderables;
      } else if (newItemCount < 0) { // Messages were deleted from list
        const newRenderables = prevRenderables.filter(i => i < list.length);
        return newRenderables;
      } else if (areMessagesAddedToStart) {
        return prevRenderables.map(prevIndex => prevIndex + newItemCount);
      } else { // Messages added to the end of list
        const scrollEl = ref.current;
        const newBatch = times(newItemCount, i => boundaryIndex + i + 1);
        let newRenderables = uniq([...prevRenderables, ...newBatch]);
        // Do not render very old items when user is viewing the latest items
        if (scrollEl && newRenderables.length > maxRenderablesCount) {
          const maxScrollTop = scrollEl.scrollHeight - scrollEl.offsetHeight;
          const isScrolledToBottom = maxScrollTop - scrollEl.scrollTop < 50;
          if (isScrolledToBottom) {
            newRenderables = takeRight(newRenderables, maxRenderablesCount);
          }
        }
        return newRenderables;
      }
    });
    setInternalList([...list]);
    // eslint-disable-next-line
  }, [list, list.length]);

  useEffect(() => {
    if (forceRender) {
      handleNextBatch();
      setForceRender(false);
    }
  }, [forceRender, handleNextBatch]);

  // Remove lock when renderables change
  useEffect(() => {
    lockRef.current = false;
  }, [renderables]);

  return {
    handleScroll,
    list: internalList,
    renderables,
    scrollRef: ref,
  };
}

export default useReverseInfiniteScroll;
