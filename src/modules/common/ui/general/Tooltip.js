import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { forwardRef } from '@common/ui/hoc';
import { useIsTouch } from '@common/hooks';
import Popover from './Popover';

// TODO Add support for touch devices i.e, show tooltip on long press
// TODO Add support to specify the event on which tooltip should appear
// TODO Add arrow to tooltip
function Tooltip({
  children,
  component = 'span',
  forwardedRef,
  isDisabled = false,
  popoverProps = {},
  title,
  titleClassName,
  ...remainingProps
}) {
  const ref = useRef();
  const [isOpen, setOpen] = useState(false);
  const isTouch = useIsTouch();

  const handleClose = useCallback(() => setOpen(false), []);
  const handleOpen = useCallback(() => setOpen(true), []);

  const attachRef = useCallback(el => {
    ref.current = el;

    if (typeof forwardedRef === 'function') {
      forwardedRef(el);
    } else if (forwardedRef) {
      // eslint-disable-next-line no-param-reassign
      forwardedRef.current = el;
    }
  }, [forwardedRef]);

  function tooltipUi() {
    return (
      <Popover
        anchorRef={ref}
        className={classNames(
          'tooltip',
          { [titleClassName]: titleClassName },
        )}
        isOpen={!isDisabled && !isTouch && isOpen}
        onClose={handleClose}
        {...popoverProps}
      >
        {title}
      </Popover>
    );
  }

  function contentUi() {
    return React.createElement(
      component,
      {
        ref: attachRef,
        onMouseEnter: handleOpen,
        onMouseLeave: handleClose,
        ...remainingProps,
      },
      children,
    );
  }

  return (
    <>
      {contentUi()}
      {tooltipUi()}
    </>
  );
}

Tooltip.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType,
  ]).isRequired,
  isDisabled: PropTypes.bool,
  titleClassName: PropTypes.string,
  popoverProps: PropTypes.object.isRequired,
  title: PropTypes.node.isRequired,
};

export default forwardRef(Tooltip);
