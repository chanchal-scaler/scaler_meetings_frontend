import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import StarRating from 'react-star-rating-component';

// Can only be used as controlled component
function Rating({
  className,
  isLarge,
  onChange,
  label,
  labelClassName,
  emptyStarColor = '#cccccc',
  ...remainingProps
}) {
  const handleChange = useCallback((value, _, name) => {
    onChange({ target: { name, value } });
  }, [onChange]);
  return (
    <div
      className={classNames(
        'rating',
        { 'rating--large': isLarge },
        { [className]: className },
      )}
    >
      <StarRating
        onStarClick={handleChange}
        emptyStarColor={emptyStarColor}
        {...remainingProps}
      />
      <p
        className={classNames({ [labelClassName]: labelClassName })}
      >
        {label}
      </p>
    </div>
  );
}

Rating.propTypes = {
  isLarge: PropTypes.bool,
  onChange: PropTypes.func,
  value: PropTypes.number.isRequired,
};

export default Rating;
