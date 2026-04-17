import React, { useContext, useEffect } from 'react';
import classNames from 'classnames';

import SelectContext from './context';

function SelectInput({
  handleBlur,
  handleFocus,
  inputRef,
  placeholder,
}) {
  const {
    value,
    showInput,
    isMulti,
    internalIsOpen,
    internalValue,
    getHandlers,
    classNamePrefix,
  } = useContext(SelectContext);

  useEffect(() => {
    if (internalIsOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef, internalIsOpen]);

  return (
    showInput && (
      <input
        type="text"
        className={classNames(
          'select__input',
          { [`${classNamePrefix}__input`]: classNamePrefix },
          {
            'select__input--hidden':
              !internalIsOpen && value.length > 0 && !isMulti,
          },
          {
            [`${classNamePrefix}__input--hidden`]: (
              !internalIsOpen && value.length > 0
              && !isMulti && classNamePrefix
            ),
          },
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={(e) => getHandlers.handleTitleClick(e)}
        onChange={(e) => getHandlers.handleInputChange(e)}
        value={internalValue}
        ref={inputRef}
        placeholder={placeholder}
      />
    )
  );
}

export default SelectInput;
