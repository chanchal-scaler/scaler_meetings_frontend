import classNames from 'classnames';
import React, { useCallback, useMemo } from 'react';
import xorBy from 'lodash/xorBy';

import Tappable from './Tappable';

const Tag = ({
  value, option, onChange, isMulti, activeClass, tagClassName,
}) => {
  const isSelected = useMemo(() => {
    if (isMulti) {
      return value?.some(v => v === option.value);
    } else {
      return (option.value === value);
    }
  }, [isMulti, option.value, value]);

  const handleClick = useCallback(() => {
    onChange(option);
  }, [onChange, option]);
  return (
    <Tappable
      className={classNames(
        'tag-select no-highlight evenly-spaced__item',
        'h6',
        [tagClassName],
        { 'tag-select--selected': (!activeClass && isSelected) },
        { [activeClass]: (activeClass && isSelected) },
      )}
      onClick={handleClick}
    >
      {option.label}
    </Tappable>
  );
};

/**
 * TagSelect Component configuration
 *
 *
 * @param {string || [string]} value - selected value
 * @param {Function} [onChange] - select and unselect tag
 * @param {[object]}  [options] - list of tags
 * @param {string} [className] - styles for component
 * @param {boolean} [isMulti] - can select multiple tags
 *
 * @example
 *
 * const [tags, setTags] = useState([]);
 * <TagSelect
 *   options={[
 *     { label: 'Community', value: 'Community' },
 *     { label: 'Video Quality', value: 'Video Quality' }
 *   ]}
 *   value={tags}
 *   onChange={newValue => setTags(newValue)}
 * />
 */

const TagSelect = ({
  value,
  onChange,
  options,
  className,
  activeClass,
  tagClassName,
  isMulti = false,
}) => {
  const handleChange = useCallback((newOption) => {
    if (isMulti) {
      const newValue = xorBy(value, [newOption.value]);
      onChange(newValue, newOption.value);
    } else {
      onChange(newOption.value);
    }
  }, [isMulti, onChange, value]);

  return (
    <div
      className={classNames(
        'tags-select evenly-spaced evenly-spaced--small',
        [className],
      )}
    >
      {options.map((option, index) => (
        <Tag
          key={index}
          onChange={handleChange}
          option={option}
          isMulti={isMulti}
          value={value}
          activeClass={activeClass}
          tagClassName={tagClassName}
        />
      ))}
    </div>
  );
};

export default TagSelect;
