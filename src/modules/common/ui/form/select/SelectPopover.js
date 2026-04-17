/* eslint-disable no-nested-ternary */
import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import clamp from 'lodash/clamp';

import { isFunction } from '@common/utils/type';
import Popover from '@common/ui/general/Popover';
import SelectContext from './context';
import SelectOption from './SelectOption';
import { useKeyboardHandler } from '@common/hooks';
import { isInViewport, scrollToElement } from '@common/utils/dom';

const popoverLocationMap = {
  bottom: {
    left: 0,
    top: '110%',
  },
  top: {
    left: 0,
    bottom: '110%',
  },
};

function SelectPopover({
  popoverClassName,
  placement,
  style,
  onClose,
  noOptionsMessage,
  gtmEventType,
  gtmEventAction,
  gtmEventCategory,
  ...remainingPopoverProps
}) {
  const {
    value,
    isMulti,
    isCreateable,
    options,
    internalValue,
    getHandlers,
    newOptionCreator,
    classNamePrefix,
    popoverRef,
    anchorRef,
    internalIsOpen,
    uniqValueKey,
    optionsPlacement,
  } = useContext(SelectContext);

  const downPress = useKeyboardHandler(anchorRef, 'ArrowDown');
  const upPress = useKeyboardHandler(anchorRef, 'ArrowUp');
  const enterPress = useKeyboardHandler(anchorRef, 'Enter');
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (popoverRef.current) {
      const cursorEl = popoverRef.current.childNodes[cursor];

      if (cursorEl && !isInViewport(cursorEl)) {
        scrollToElement(cursorEl, 0);
      }
    }
  }, [cursor, popoverRef]);

  useEffect(() => {
    if (options.length && upPress) {
      const newCursor = clamp(cursor - 1, 0, options.length - 1);
      setCursor(newCursor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upPress]);

  useEffect(() => {
    if (options.length && downPress) {
      const newCursor = clamp(cursor + 1, 0, options.length - 1);
      setCursor(newCursor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downPress]);

  useEffect(() => {
    if (options.length && enterPress) {
      if (cursor !== null) {
        getHandlers.handleOptionChange(options[cursor]);
      }
      setCursor(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterPress]);

  const handleClose = () => {
    setCursor(0);
    if (isFunction(onClose)) {
      onClose();
    }
  };

  function optionUi(option, index) {
    const isSelected = value && value.findIndex(
      item => item.key === option.key,
    ) !== -1;

    return (
      <SelectOption
        key={option.key}
        option={option}
        isSelected={isSelected}
        isActive={index === cursor}
        gtmEventType={gtmEventType}
        gtmEventAction={gtmEventAction}
        gtmEventResult={gtmEventType ? option.value : undefined}
        gtmEventCategory={gtmEventCategory}
        isDisabled={option.disabled}
      />
    );
  }

  function optionsUi() {
    const optionsToShow = options;
    if (!isCreateable && optionsToShow?.length === 0) {
      return (
        <div
          className={classNames(
            'select__option-empty',
            { [`${classNamePrefix}__option-empty`]: classNamePrefix },
          )}
        >
          {noOptionsMessage}
        </div>
      );
    } else {
      return optionsToShow.map((option, index) => optionUi(option, index));
    }
  }

  function allowNewOption() {
    const inputValue = internalValue.toLowerCase().trim();
    if (inputValue === '') return false;
    if (isCreateable) {
      if (isMulti) {
        if (value.findIndex(
          o => o.value.toLowerCase() === internalValue.toLowerCase().trim(),
        ) !== -1) {
          return false;
        }
      }
      if (options.findIndex(
        o => o.value.toLowerCase() === internalValue.toLowerCase().trim(),
      ) !== -1) {
        return false;
      }
      return true;
    }
    return false;
  }

  const createNewOption = () => {
    if (newOptionCreator) {
      const newOption = {
        ...newOptionCreator,
        key: internalValue,
        value: internalValue,
        dataOption: 'option-create',
        [uniqValueKey]: internalValue,
      };
      return newOption;
    } else {
      return {
        key: internalValue,
        value: internalValue,
        dataOption: 'option-create',
      };
    }
  };

  return (
    <Popover
      ref={popoverRef}
      anchorRef={anchorRef}
      className={classNames(
        'select__popover scroll',
        { [`${classNamePrefix}__popover`]: classNamePrefix },
        { [popoverClassName]: popoverClassName },
      )}
      isOpen={internalIsOpen}
      location={popoverLocationMap[optionsPlacement]}
      onClose={handleClose}
      style={style}
      {...remainingPopoverProps}
    >
      <>
        {optionsUi()}
        {allowNewOption() && optionUi(createNewOption())}
      </>
    </Popover>
  );
}

export default SelectPopover;
