import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { withGTMTracking } from '@common/ui/hoc';

function RadioButton({
  active = false,
  name,
  onChange,
  disabled,
  text = '',
  textClassName,
  className,
  onClick,
}) {
  return (
    <label
      className={classNames(
        'sr-radio-button',
        { 'sr-radio-button--disabled': disabled },
        { [className]: className },
      )}
    >
      <input
        checked={active}
        className="sr-radio-button__input"
        name={name}
        onChange={onChange}
        disabled={disabled}
        type="radio"
        onClick={onClick}
      />
      <span
        className={classNames(
          'sr-radio-button__text',
          { [textClassName]: textClassName },
        )}
      >
        {text}
      </span>
    </label>
  );
}

RadioButton.propTypes = {
  active: PropTypes.bool,
  name: PropTypes.string.isRequired,
  text: PropTypes.node,
  textClassName: PropTypes.string,
};

export default withGTMTracking(RadioButton);
