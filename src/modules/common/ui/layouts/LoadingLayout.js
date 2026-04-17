import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { CricketBall, LogoSpinner } from '@common/ui/loaders';

const loaderComponentMap = {
  none: LogoSpinner,
  cricket: CricketBall,
};

function Loader(props) {
  // eslint-disable-next-line camelcase
  const theme = window.ENV_VARS?.config?.seasonal_theme_mode || 'none';
  const LoaderComponent = loaderComponentMap[theme] || LogoSpinner;
  return <LoaderComponent {...props} />;
}

function LoadingLayout({
  className,
  isFit,
  isTransparent,
  small,
  ...remainingProps
}) {
  return (
    <div
      className={classNames(
        'layout full-width',
        { [className]: className },
      )}
      {...remainingProps}
    >
      <div
        className={classNames(
          'layout__content',
          'layout__content--centered',
          'p-10',
          { 'layout__content--fit': isFit },
          { 'layout__content--transparent': isTransparent },
        )}
      >
        <Loader small={small} />
      </div>
    </div>
  );
}

LoadingLayout.propTypes = {
  isFit: PropTypes.bool,
  isTransparent: PropTypes.bool,
};

export default LoadingLayout;
