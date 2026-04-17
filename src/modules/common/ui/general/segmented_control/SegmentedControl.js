import React, {
  Children, cloneElement, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * A segemented control component. Commonly seen on iOS devices.
 * This is a controlled component so `value` and `onChange` are required props.
 */
function SegmentedControl({
  children: _children,
  activeClassName,
  className,
  onChange,
  value,
  ...remainingProps
}) {
  const [internalValue, setInternalValue] = useState(value);
  const children = React.Children.toArray(_children).filter(o => Boolean(o));

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  function itemUi(child) {
    const isActive = internalValue === child.props.name;

    const propsToInject = {
      isActive,
      onChange,
      className: classNames(
        { [activeClassName]: isActive && activeClassName },
        { [child.props.className]: child.props.className },
      ),
    };

    return cloneElement(child, propsToInject);
  }

  return (
    <div
      className={classNames(
        'segmented-control',
        { [className]: className },
      )}
      {...remainingProps}
    >
      {Children.map(children, itemUi)}
    </div>
  );
}

SegmentedControl.propTypes = {
  activeClassName: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

export default SegmentedControl;
