import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import AttentionMark from './AttentionMark';

function Label({
  children,
  className,
  compact,
  required = false,
  ...remainingProps
}) {
  return (
    <div
      className={classNames(
        'form-field-label',
        { 'form-field-label--compact': compact },
        { [className]: className },
      )}
      {...remainingProps}
    >
      {children}
      {required && <AttentionMark className="form-field-label__required" />}
    </div>
  );
}

Label.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  compact: PropTypes.bool,
  required: PropTypes.bool.isRequired,
};

export default Label;
