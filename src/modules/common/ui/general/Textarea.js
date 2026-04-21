import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import compose from 'lodash/fp/compose';

import { forwardRef, withGTMTracking } from '@common/ui/hoc';

function getParsedComputedStyles(target) {
  const computedStyles = window.getComputedStyle(target);
  const lineHeight = parseInt(computedStyles.lineHeight, 10);
  const paddingVertical = parseInt(computedStyles.paddingTop, 10)
    + parseInt(computedStyles.paddingBottom, 10);
  return { lineHeight, paddingVertical };
}

function Textarea({
  className,
  forwardedRef,
  value = '',
  maxRows = 5,
  minRows = 1,
  onChange,
  ...remainingProps
}) {
  const elementRef = useRef(null);
  const [internalValue, setInternalValue] = useState(value);
  const [rows, setRows] = useState(1);

  // Attached methods to ref
  useImperativeHandle(forwardedRef, () => {
    const handle = elementRef.current;

    handle.focusAtPosition = (position) => {
      // Focus chat input and update cursor position
      elementRef.current.focus();

      // For some reason in react we have to wait for the component to be
      // updated to set new cursor position. So we are wrapping it in a
      // `setTimeout`. Even though it is hacky it works!
      setTimeout(() => {
        elementRef.current.setSelectionRange(position, position);
      }, 100);
    };

    return handle;
  });

  // When value is changes from outside of this component
  useEffect(() => {
    if (value !== internalValue) setInternalValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Resize when content changes
  useEffect(() => {
    const target = elementRef.current;

    const oldRows = target.rows;
    // Without this deleting letters will not resize textarea correctly
    target.rows = 1;
    const { lineHeight, paddingVertical } = getParsedComputedStyles(target);
    const totalLines = (target.scrollHeight - paddingVertical) / lineHeight;
    const newRows = Math.max(Math.min(parseInt(totalLines, 10), maxRows),
      minRows);

    if (newRows === oldRows) {
      target.rows = newRows;
    }
    setRows(newRows);
  }, [internalValue, maxRows, minRows]);

  const handleChange = useCallback(({ target }) => {
    setInternalValue(target.value);
    // eslint-disable-next-line no-unused-expressions
    onChange && onChange({ target });
  }, [onChange]);

  return (
    <textarea
      className={classNames(
        'textarea',
        { [className]: className },
      )}
      ref={elementRef}
      rows={rows}
      value={internalValue}
      onChange={handleChange}
      {...remainingProps}
    />
  );
}

Textarea.propTypes = {
  className: PropTypes.string,
  maxRows: PropTypes.number.isRequired,
  minRows: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.string.isRequired,
};

const hoc = compose(
  forwardRef,
  withGTMTracking,
);

export default hoc(Textarea);
