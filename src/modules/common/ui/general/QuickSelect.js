import React from 'react';
import classNames from 'classnames';

export default function QuickSelect({
  className,
  options,
  isBlock,
  onChange,
  optionClassName,
  defaultValue: defaultOption,
  value: selectedOption,
  ...remainingProps
}) {
  function optionUi(option, index) {
    const { value, label } = option;
    const { value: selectedValue } = selectedOption || defaultOption || {};
    return (
      <button
        type="button"
        key={index}
        className={classNames(
          'quick-select__option',
          { 'quick-select__option--last': index === (options.length - 1) },
          { 'quick-select__option--selected': value === selectedValue },
          { [optionClassName]: optionClassName },
        )}
        onClick={() => onChange(option)}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      className={classNames(
        'quick-select',
        { 'quick-select--block': isBlock },
        { [className]: classNames },
      )}
      {...remainingProps}
    >
      {options.map(optionUi)}
    </div>
  );
}
