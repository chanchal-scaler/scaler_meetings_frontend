/* eslint-disable no-nested-ternary */
import React, { cloneElement, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import SelectContext from './context';
import Icon from '@common/ui/general/Icon';
import SelectInput from './SelectInput';

const arrowIconMap = {
  bottom: 'chevron-down',
  top: 'chevron-down',
};

function SelectTitle({
  placeholder = 'Select an option',
  arrowPlacement = 'bottom',
  inputRef,
  className,
  iconClassName,
}) {
  const [isFocused, setFocused] = useState(false);
  const [titleClicked, setTitleClicked] = useState(false);
  const {
    value,
    showInput,
    isMulti,
    getHandlers,
    internalIsOpen,
    showArrow,
    classNamePrefix,
    anchorRef,
    children,
  } = useContext(SelectContext);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
    setTitleClicked(false);
  };

  const handleClick = () => {
    getHandlers.handleTitleClick();
    setTitleClicked(true);
  };

  function selectedOptionUi(item) {
    return (
      <div
        className={classNames(
          'select__multi-value',
          { [`${classNamePrefix}__multi-value`]: classNamePrefix },
        )}
        key={item.key}
      >
        <span
          className={classNames(
            'select__multi-text',
            { [`${classNamePrefix}__multi-text`]: classNamePrefix },
          )}
        >
          {item.value}
        </span>
        <span
          className={classNames(
            'select__multi-cross',
            { [`${classNamePrefix}__multi-cross`]: classNamePrefix },
          )}
          onClick={() => getHandlers.handleRemoveValue(item)}
          role="presentation"
        >
          &#215;
        </span>
      </div>
    );
  }

  function simpleValueUi(valObj) {
    return (
      <div
        className={classNames(
          'select__value',
          { [`${classNamePrefix}__value`]: classNamePrefix },
          {
            'select__value--hidden': internalIsOpen && showInput,
          },
          {
            [`${classNamePrefix}__value--hidden`]:
              internalIsOpen && showInput && classNamePrefix,
          },
        )}
        onClick={handleClick}
        role="button"
        tabIndex={0}
      >
        {children ? cloneElement(children, { item: valObj }) : valObj.value}
      </div>
    );
  }

  function placeholderUi() {
    return (
      <div
        className={classNames(
          'select__placeholder',
          { [`${classNamePrefix}__placeholder`]: classNamePrefix },
          {
            [`${classNamePrefix}__placeholder--hidden`]:
              classNamePrefix && isFocused,
          },
          { 'select__placeholder--hidden': isFocused },
        )}
        onClick={getHandlers.handleTitleClick}
        role="button"
        tabIndex={0}
      >
        {placeholder}
      </div>
    );
  }

  function valueUi() {
    return (
      value.length > 0 ? (isMulti ? (
        value.map(item => selectedOptionUi(item))
      ) : simpleValueUi(value[0])) : (!showInput ? placeholderUi() : '')
    );
  }

  function inputUi() {
    return (
      <SelectInput
        handleBlur={handleBlur}
        handleFocus={handleFocus}
        inputRef={inputRef}
        placeholder={placeholder}
        titleClicked={titleClicked}
      />
    );
  }

  function arrowUi() {
    return (
      <div
        className={classNames(
          'select__arrow',
          { 'select__arrow--open': internalIsOpen },
          { [iconClassName]: iconClassName },
          { [`${classNamePrefix}__arrow`]: classNamePrefix },
          {
            [`${classNamePrefix}__arrow--open`]:
              classNamePrefix && internalIsOpen,
          },
        )}
        onClick={getHandlers.handleTitleClick}
        role="button"
        tabIndex={0}
      >
        <Icon name={arrowIconMap[arrowPlacement]} />
      </div>
    );
  }

  function titleUi() {
    return (
      <>
        <div
          className={classNames(
            'select__title-left',
            { [`${classNamePrefix}__title-left`]: classNamePrefix },
          )}
        >
          {valueUi()}
          {inputUi()}
        </div>
        {showArrow && arrowUi()}
      </>
    );
  }

  return (
    <div
      ref={anchorRef}
      className={classNames(
        'select__title',
        { [className]: className },
        { 'select__title--open': internalIsOpen },
        { [`${classNamePrefix}__title`]: classNamePrefix },
        {
          [`${classNamePrefix}__title--open`]: classNamePrefix
            && internalIsOpen,
        },
      )}
    >
      {titleUi()}
    </div>
  );
}

SelectTitle.propTypes = {
  arrowPlacement: PropTypes.oneOf(Object.keys(arrowIconMap)).isRequired,
};

export default SelectTitle;
