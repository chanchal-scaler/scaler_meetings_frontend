import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { forwardRef } from '@common/ui/hoc';
import { isFunction } from '@common/utils/type';


function LinkWithRefresh({
  forwardedRef,
  onClick,
  refresh = false,
  ...remainingProps
}) {
  const handleClick = useCallback((event) => {
    if (refresh) {
      window.location.href = event.currentTarget.href;
    }
    if (isFunction(onClick)) {
      onClick();
    }
  }, [refresh, onClick]);

  return (
    <Link
      ref={forwardedRef}
      onClick={handleClick}
      {...remainingProps}
    />
  );
}

export default forwardRef(LinkWithRefresh);
