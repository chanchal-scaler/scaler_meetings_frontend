import React, {
  cloneElement,
  useContext, useRef,
} from 'react';
import classNames from 'classnames';
import SelectContext from './context';
import { withGTMTracking } from '@common/ui/hoc';

function SelectOption({
  isSelected,
  isDisabled,
  value,
  option,
  isActive,
  onClick,
  ...remainingProps
}) {
  const optionRef = useRef(null);

  const {
    getHandlers,
    classNamePrefix,
    children,
  } = useContext(SelectContext);

  function individualOptionUi() {
    if (children) {
      const propsToInject = { item: option };
      return (
        <>
          {cloneElement(children, propsToInject)}
        </>
      );
    } else {
      return option.value;
    }
  }

  return (
    <div
      className={classNames(
        'select__option',
        { 'select--disabled': isDisabled },
        { 'select__option--selected': isSelected },
        { 'select__option--active': isActive },
        { [`${classNamePrefix}__option`]: classNamePrefix },
        {
          [`${classNamePrefix}__option--selected`]:
          isSelected && classNamePrefix,
        },
        { [`${classNamePrefix}__option--active`]: isActive && classNamePrefix },
      )}
      data-option={option.dataOption || 'option-select'}
      key={option.key}
      value={option.key}
      onClick={() => {
        getHandlers.handleOptionChange(option);
        if (onClick) {
          onClick();
        }
      }}
      role="presentation"
      ref={optionRef}
      {...remainingProps}
    >
      {option?.dataOption === 'option-create' ? 'Create ' : ''}
      {individualOptionUi()}
    </div>
  );
}

export default withGTMTracking(SelectOption);
