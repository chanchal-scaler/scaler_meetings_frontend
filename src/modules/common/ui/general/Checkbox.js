import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import compose from 'lodash/fp/compose';

import { isFunction } from '@common/utils/type';
import { forwardRef } from '@common/ui/hoc';

function Checkbox({
  className,
  onChange,
  name,
  value,
  id,
  label,
  labelClassName,
  inputClassName,
  forwardedRef,
  ...remainingProps
}) {
  const [internalValue, setInternalValue] = useState(value);

  const handleChange = useCallback(({ target }) => {
    setInternalValue(target.value);
    if (isFunction(onChange)) onChange({ target });
  }, [onChange]);

  // When value is changed from outside of this component
  useEffect(() => {
    if (value !== internalValue) setInternalValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={classNames(
      'checkbox',
      { [className]: className },
    )}
    >
      <input
        type="checkbox"
        value={internalValue}
        name={name}
        id={id}
        onChange={handleChange}
        className={classNames('checkbox__input', inputClassName)}
        ref={forwardedRef}
        {...remainingProps}
      />
      <label
        htmlFor={id}
        className={labelClassName}
      >
        {label}
      </label>
    </div>
  );
}

Checkbox.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
  inputClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  value: PropTypes.bool,
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  label: PropTypes.string,
};

const hoc = compose(
  forwardRef,
);

export default hoc(Checkbox);
