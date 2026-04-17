import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function Switch({
  activeColor,
  checked = false,
  className,
  disabled = false,
  small,
  ...remainingProps
}) {
  function getActiveStyle() {
    if (activeColor && checked) {
      return { backgroundColor: activeColor };
    } else {
      return {};
    }
  }

  return (
    <div
      className={classNames(
        'switch',
        { 'switch--checked': checked },
        { 'switch--disabled': disabled },
        { 'switch--default': !small },
        { 'switch--small': small },
        { [className]: className },
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        {...remainingProps}
      />
      <div
        className="switch__track"
        style={getActiveStyle()}
      >
        <div className="switch__thumb" />
      </div>
    </div>
  );
}

Switch.propTypes = {
  activeColor: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  small: PropTypes.bool,
};

export default Switch;
