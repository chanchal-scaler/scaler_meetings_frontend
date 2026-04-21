import React, { useCallback, useRef } from 'react';
import { observer } from 'mobx-react';

import {
  Popover,
} from '@common/ui/general';
import { useOutsideClick } from '@common/hooks';
import crossIcon from '~meetings/images/cross.svg';

function QuickViewPopoverWrapper({
  children, content, parentRef,
  closeOnOutsideClick = true,
}) {
  const rootRef = useRef(null);

  const handleClose = () => {
    if (closeOnOutsideClick) {
      content.setQuickViewOpen(false);
    }
  };

  useOutsideClick(rootRef, handleClose);

  const getValidPosition = useCallback(
    ({ container, position, popoverRect }) => {
      const newPosition = { ...position };

      const viewportLeft = container.scrollLeft;
      const viewportRight = viewportLeft + container.offsetWidth;

      const popoverLeft = position.left;
      const popoverRight = popoverLeft + popoverRect.width;

      if (popoverLeft < viewportLeft) {
        // Extra 10px for margin
        newPosition.left += (viewportLeft - popoverLeft + 10);
      } else if (popoverRight > viewportRight) {
        // Extra 10px for margin
        newPosition.left -= (popoverRight - viewportRight + 10);
      }

      return newPosition;
    },
    [],
  );

  return (
    <Popover
      isOpen={content.isQuickViewOpen}
      ref={rootRef}
      anchorRef={parentRef}
      onClose={handleClose}
      placement="top"
      className="m-quick-view"
      extraScope="meeting-app"
      getValidPosition={getValidPosition}
    >
      <div
        className="m-quick-view__header-layout"
      >
        <div className="h3 bold ">{`${content.order}. ${content.name}`}</div>
        <img
          className="cursor m-quick-view__cross"
          src={crossIcon}
          alt="Cross"
          onClick={() => content.setQuickViewOpen(false)}
          role="presentation"
        />
      </div>
      {children}
    </Popover>
  );
}

export default observer(QuickViewPopoverWrapper);
