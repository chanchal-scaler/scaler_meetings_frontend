import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Tappable from '@common/ui/general/Tappable';

function HintLayout({
  actionFn,
  actionLabel = 'Try Again',
  className,
  isFit,
  isTransparent,
  message,
  heading,
  img,
  imgClassName,
  imgComponent,
  subHeading,
  ...remainingProps
}) {
  return (
    <div
      className={classNames(
        'layout',
        { [className]: className },
      )}
      {...remainingProps}
    >
      <div
        className={classNames(
          'layout__content layout__content--centered p-10',
          { 'layout__content--fit': isFit },
          { 'layout__content--transparent': isTransparent },
        )}
      >
        {img && (
          <img
            src={img}
            alt={message}
            className={classNames(
              { [imgClassName]: imgClassName },
            )}
          />
        )}
        {imgComponent}
        {heading && <h2 className="text-c no-mgn-b">{heading}</h2>}
        {subHeading}
        <p className="text-c no-mgn-b">{message}</p>
        {actionLabel && actionFn && (
          <Tappable className="btn btn-primary m-t-10" onClick={actionFn}>
            {actionLabel}
          </Tappable>
        )}
      </div>
    </div>
  );
}

HintLayout.propTypes = {
  actionFn: PropTypes.func,
  actionLabel: PropTypes.string,
  isFit: PropTypes.bool,
  isTransparent: PropTypes.bool,
  message: PropTypes.string.isRequired,
};

export default HintLayout;
