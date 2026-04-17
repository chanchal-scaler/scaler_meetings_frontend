import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';

import { NPS_OPTIONS_10 } from '@common/utils/npsRatingVersion';
import Tappable from './Tappable';

const NpsRatingOption = ({
  option,
  onClick,
  currentOption,
  small,
}) => {
  const currentValue = currentOption?.value;
  const hasSelection = currentValue && currentValue > 0;
  const isActive = currentValue && option.value <= currentValue;
  const isInActive = hasSelection && (option.value > currentValue);

  const handleClick = useCallback(() => {
    onClick(option.value);
  }, [onClick, option.value]);

  return (
    <Tappable
      onClick={handleClick}
      className={classNames(
        'btn',
        'evenly-spaced__item',
        'nps-rating__option',
        { [`nps-rating__option--${option.type}`]: !hasSelection },
        { [`nps-rating__option--${currentOption?.type}-selected`]: isActive },
        { 'nps-rating__option--small': small },
        { 'nps-rating__option--not-selected': isInActive },
      )}
    >
      {option.label}
    </Tappable>
  );
};

/**
 * NpsRating Component configuration
 *
 *
 * @param {Function} [onChange] - function to update selected rating
 * @param {string} [value] - selected rating
 * @param {[object]}  [options] - configuration of labels
 *
 * @note
 *    - @param options should strictly follow the format of defaultOptions
 *      and should only change the label only if told by a superior
 *    - nps ratings follow a scale of 10 so value shouldn't be changed
 *
 * @example
 *
 * const [rating, setRating] = useState(null);
 * <NpsRating options={[{
 * value: 1,
 * label: '0.5',
 * type: 'detractor|neutral|promoter' // use NPS_RATING_TYPES enum here
 * }]}
 * value={rating}
 * onChange={newValue => setRating(newValue)}
 * />
 *
 */

const NpsRating = ({
  onChange,
  value,
  options = NPS_OPTIONS_10,
  small = false,
  className,
}) => {
  const currentOption = useMemo(() => (
    value
      ? options.find(option => option.value === value)
      : null
  ), [options, value]);

  const handleChange = useCallback((newRating) => {
    onChange(newRating);
  }, [onChange]);


  return (
    <div className={classNames('nps-rating',
      'evenly-spaced',
      { 'evenly-spaced--small': small },
      { [className]: className })}
    >
      {options.map((option, index) => (
        <NpsRatingOption
          small={small}
          key={index}
          option={option}
          onClick={handleChange}
          currentValue={value}
          currentOption={currentOption}
        />
      ))}
    </div>
  );
};

export default NpsRating;
