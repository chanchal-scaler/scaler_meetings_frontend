import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function AspectRatio({
  children,
  className,
  containerClassName,
  ratio,
  dataCy,
  style = {},
  ...remainingProps
}) {
  return (
    <div
      className={classNames(
        'aspect-ratio',
        { [containerClassName]: containerClassName },
      )}
      style={{ paddingTop: `${100 / ratio}%` }}
      data-cy={dataCy}
    >
      <div
        className={classNames(
          'aspect-ratio__container',
          { [className]: className },
        )}
        style={style}
        {...remainingProps}
      >
        {children}
      </div>
    </div>
  );
}

AspectRatio.propTypes = {
  className: PropTypes.string,
  ratio: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
  dataCy: PropTypes.string,
};

export default AspectRatio;
