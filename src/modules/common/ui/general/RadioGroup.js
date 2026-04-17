import React, { Children, cloneElement, useCallback } from 'react';
import classNames from 'classnames';

const divider = '::';

function RadioGroup({
  children,
  className,
  name,
  onChange,
  value,
  disabled,
  ...remainingProps
}) {
  const handleChange = useCallback((event) => {
    const { checked, name: selectionName } = event.target;
    if (checked) {
      const [, selectedValue] = selectionName.split(divider);
      onChange({ target: { name, value: selectedValue } });
    }
  }, [name, onChange]);

  function radioUi(child) {
    const isActive = child.props.name === value;
    const isDisabled = disabled;
    const propsToInject = {
      active: isActive,
      disabled: isDisabled,
      name: `${name}${divider}${child.props.name}`,
      onChange: handleChange,
    };
    return cloneElement(child, propsToInject);
  }

  return (
    <div
      className={classNames(
        'sr-radio-group',
        { [className]: className },
      )}
      {...remainingProps}
    >
      {Children.map(children, radioUi)}
    </div>
  );
}

export default RadioGroup;
