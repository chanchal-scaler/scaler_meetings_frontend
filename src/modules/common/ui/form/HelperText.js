import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function HelperText({ className, type = 'hint', ...remainingProps }) {
  return (
    <div
      className={classNames(
        'form-helper-text',
        { [`form-helper-text--${type}`]: type },
        { [className]: className },
      )}
      {...remainingProps}
    />
  );
}

HelperText.propTypes = {
  className: PropTypes.string,
  type: PropTypes.oneOf(['error', 'hint', 'success']),
};

export default HelperText;
