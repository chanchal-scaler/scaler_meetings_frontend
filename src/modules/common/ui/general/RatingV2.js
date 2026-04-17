import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function RatingOption({
  activeIcon,
  currentValue,
  inActiveIcon,
  onClick,
  option,
  optionValue,
  readOnly,
}) {
  const hasSelection = currentValue > 0;
  const isActive = optionValue < currentValue;
  const isSelected = optionValue === currentValue;
  const isInActive = hasSelection && (optionValue > currentValue);

  function getCurrentImage() {
    if (isActive) {
      return activeIcon;
    } else if (isSelected) {
      return option.selectedIcon;
    } else if (isInActive) {
      return inActiveIcon;
    } else {
      return option.normalIcon;
    }
  }

  const handleClick = useCallback(() => {
    onClick(optionValue);
  }, [onClick, optionValue]);

  return (
    <button
      className={classNames(
        'rating-option',
        { 'rating-option--readonly': readOnly },
        { 'rating-option--active': isActive },
        { 'rating-option--selected': isSelected },
        { 'rating-option--in-active': isInActive },
      )}
      onClick={handleClick}
      type="button"
    >
      <div className="rating-option__icon">
        <img alt="Rating icon" src={getCurrentImage()} />
      </div>
      <div className="rating-option__label">
        {option.label}
      </div>
    </button>
  );
}

function RatingV2({
  activeIcon,
  inActiveIcon,
  name,
  onChange,
  options,
  readOnly,
  value,
}) {
  const handleChange = useCallback((newValue) => {
    if (readOnly) return;

    onChange({ target: { name, value: newValue } });
  }, [name, onChange, readOnly]);

  return (
    <div className="rating-2">
      {options.map(((option, index) => (
        <RatingOption
          key={index}
          activeIcon={activeIcon}
          currentValue={value}
          inActiveIcon={inActiveIcon}
          onClick={handleChange}
          option={option}
          optionValue={index + 1}
          readOnly={readOnly}
        />
      )))}
    </div>
  );
}

const optionProptype = PropTypes.exact({
  normalIcon: PropTypes.string.isRequired,
  selectedIcon: PropTypes.string.isRequired,
  label: PropTypes.string,
});

RatingV2.propTypes = {
  activeIcon: PropTypes.string.isRequired,
  inActiveIcon: PropTypes.string.isRequired,
  name: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(optionProptype).isRequired,
  readOnly: PropTypes.bool,
  value: PropTypes.number,
};

export default RatingV2;
