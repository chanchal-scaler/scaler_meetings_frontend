/* eslint-disable no-nested-ternary */
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {
  isBoolean, isFunction, isArray, isNullOrUndefined,
} from '@common/utils/type';
import { useOutsideClick } from '@common/hooks';
import SelectTitle from './SelectTitle';
import SelectPopover from './SelectPopover';
import SelectContext from './context';

function Select({
  className,
  classNamePrefix,
  compact,
  name,
  noOptionsMessage = 'No options',
  onChange,
  onClick,
  onOutsideClick,
  optionsPlacement = 'bottom',
  placeholder = 'Select an option',
  popoverProps = {},
  isDisabled = false,
  isOpen = false,
  onInput,
  keepOpen = false,
  value: initialValueObject,
  isAsync,
  isSearchable,
  isCreateable,
  iconClassName,
  isMulti,
  options: optionsList,
  loadOptions,
  showArrow = true,
  titleClassName,
  newOptionCreator,
  uniqValueKey = 'value',
  children,
  gtmEventType,
  gtmEventAction,
  gtmEventCategory,
  ...remainingProps
}) {
  const anchorRef = useRef(null);
  const popoverRef = useRef(null);
  const inputRef = useRef(null);

  const setInitialValueObject = useCallback(() => {
    if (isArray(initialValueObject)) {
      return [...initialValueObject];
    } else if (isNullOrUndefined(initialValueObject)
      || initialValueObject === '') {
      return [];
    } else {
      return [initialValueObject];
    }
  }, [initialValueObject]);

  const [value, setValue] = useState(setInitialValueObject());
  const [options, setOptions] = useState(optionsList || []);
  const [inputWidth, setInputWidth] = useState('none');
  const [internalIsOpen, setInternalOpen] = useState(Boolean(isOpen));
  const [internalValue, setInternalValue] = useState('');
  const [showInput, setShowInput] = useState(
    Boolean(isMulti || isSearchable || isCreateable),
  );
  const {
    className: popoverClassName,
    ...remainingPopoverProps
  } = popoverProps;

  useEffect(() => {
    setValue(setInitialValueObject());
  }, [setInitialValueObject]);

  useEffect(() => {
    if (anchorRef.current) {
      setInputWidth(anchorRef.current.offsetWidth);
    }
  }, [value, anchorRef, inputWidth, options]);

  useEffect(() => {
    if (isBoolean(isOpen)) {
      setInternalOpen(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isBoolean(isMulti || isSearchable || isCreateable)) {
      setShowInput(isMulti || isSearchable || isCreateable);
    }
  }, [isMulti, isSearchable, isCreateable]);

  const filterOptions = useCallback((optionsArray, val) => {
    const filtered = optionsArray.filter(
      item => item.value.toLowerCase().includes(
        val.toLowerCase(),
      ),
    );
    return filtered;
  }, []);

  const filterMultiOptions = useCallback((optionsArray, values) => {
    const filtered = optionsArray.filter(
      ar => !values.find(
        rm => (rm.key === ar.key),
      ),
    );
    return filtered;
  }, []);

  const handleChange = useCallback((internalOpen) => {
    setInternalValue('');
    setInternalOpen(internalOpen);
  }, [setInternalOpen]);


  const handleRemoveValue = useCallback(async (item) => {
    const selectedValues = value;
    const filteredValues = selectedValues.filter(val => val.key !== item.key);
    setValue(filteredValues);

    let customEvent = new Event('build');
    customEvent = { target: { name, value: filteredValues } };

    if (isFunction(onChange)) {
      onChange(customEvent);
    }
  }, [value, onChange, name]);

  const handleOptionChange = useCallback((selectedValue) => {
    const isAlreadyExists = value.find(
      (option) => option.key === selectedValue.key,
    );
    if (isAlreadyExists) {
      handleRemoveValue(selectedValue);
      return;
    }
    const event = { target: { name, value: { ...selectedValue } } };
    let customEvent = new Event('build');
    const updatedValues = [...value, event.target.value];
    customEvent = { target: { name, value: updatedValues } };
    if (isMulti) {
      setValue(updatedValues);
    } else {
      setValue([event.target.value]);
    }
    if (isFunction(onChange)) {
      if (isMulti) {
        onChange(customEvent);
      } else {
        onChange(event);
      }
    }
    if (!keepOpen) handleChange(!internalIsOpen);
  }, [isMulti, name, value, onChange, keepOpen,
    handleRemoveValue, handleChange, internalIsOpen]);

  const handleClose = useCallback(() => {
    handleChange(false);
  }, [handleChange]);

  const handleTitleClick = useCallback(async (event) => {
    anchorRef.current.focus();
    setInternalValue('');
    let newOptions = [];
    if (isAsync) {
      const asyncResponse = await loadOptions(internalValue);
      newOptions = asyncResponse?.options || [];
    } else {
      newOptions = [...optionsList];
    }
    if (isMulti) newOptions = filterMultiOptions(newOptions, value);
    setOptions(newOptions);
    setInternalOpen(!internalIsOpen);
    if (isFunction(onClick)) {
      onClick(event);
    }
  }, [internalIsOpen, onClick, setOptions, loadOptions,
    optionsList, isMulti, filterMultiOptions, value, isAsync,
    internalValue]);

  const handleOutsideClick = useCallback((event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target)) {
      handleClose();
      if (isFunction(onOutsideClick)
      && anchorRef.current && !anchorRef.current.contains(event.target)) {
        onOutsideClick(event);
      }
    }
  }, [handleClose, onOutsideClick]);

  useOutsideClick(popoverRef, handleOutsideClick);

  const handleInputChange = useCallback(async (event) => {
    if (isFunction(onInput)) {
      onInput(event);
    } else {
      setInternalValue(event.target.value);
      if (!internalIsOpen) {
        setInternalOpen(true);
      }
      let newOptions = [];
      if (isAsync) {
        const asyncResponse = await loadOptions(event.target.value);
        if (asyncResponse.options && asyncResponse.options.length > 0) {
          newOptions = filterOptions(asyncResponse.options, internalValue);
        }
      } else {
        newOptions = filterOptions(optionsList, event.target.value);
      }
      if (isMulti) newOptions = filterMultiOptions(newOptions, value);
      setOptions(newOptions);
    }
  }, [onInput, optionsList, filterMultiOptions, isMulti, value,
    isAsync, loadOptions, internalValue, internalIsOpen, filterOptions]);

  const getHandlers = useMemo(() => ({
    handleRemoveValue, handleOptionChange, handleTitleClick, handleInputChange,
  }), [handleRemoveValue, handleOptionChange, handleInputChange,
    handleTitleClick]);

  function titleUi() {
    return (
      <SelectTitle
        placeholder={placeholder}
        arrowPlacement={optionsPlacement}
        inputRef={inputRef}
        className={titleClassName}
        iconClassName={iconClassName}
      />
    );
  }

  function popoverUi() {
    return (
      <SelectPopover
        placement={optionsPlacement}
        onClose={handleClose}
        style={{ width: inputWidth }}
        noOptionsMessage={noOptionsMessage}
        gtmEventType={gtmEventType}
        gtmEventAction={gtmEventAction}
        gtmEventCategory={gtmEventCategory}
        popoverClassName={popoverClassName}
        {...remainingPopoverProps}
      />
    );
  }

  return (
    <SelectContext.Provider
      value={{
        options,
        value,
        showInput,
        internalValue,
        isSearchable,
        isCreateable,
        isMulti,
        getHandlers,
        internalIsOpen,
        showArrow,
        newOptionCreator,
        classNamePrefix,
        popoverRef,
        anchorRef,
        uniqValueKey,
        children,
        optionsPlacement,
      }}
    >
      <div
        className={classNames(
          'select',
          { 'select--compact': compact },
          { 'select--disabled': isDisabled },
          { [`${classNamePrefix}__select`]: classNamePrefix },
          { [className]: className },
        )}
        {...remainingProps}
      >
        {titleUi()}
        {popoverUi()}
      </div>
    </SelectContext.Provider>
  );
}

Select.propTypes = {
  isDisabled: PropTypes.bool,
  noOptionsMessage: PropTypes.node.isRequired,
  compact: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  placeholder: PropTypes.node.isRequired,
  onOutsideClick: PropTypes.func,
};

export default Select;
