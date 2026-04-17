import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function AttentionMark({ className, color, ...remainingProps }) {
  return (
    <span
      className={classNames(
        'form-attention-mark',
        { [className]: className },
      )}
      style={{ color }}
      {...remainingProps}
    >
      *
    </span>
  );
}

AttentionMark.propTypes = {
  classNames: PropTypes.string,
  color: PropTypes.string,
};

export default AttentionMark;
