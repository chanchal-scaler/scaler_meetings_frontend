import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import defaultLogo from '@common/images/svg/logo.svg';

function LogoSpinner({
  className,
  logo = defaultLogo,
  small,
  ...remainingProps
}) {
  return (
    <div
      className={classNames(
        'l-logo-spinner',
        { 'l-logo-spinner--small': small },
        { [className]: className },
      )}
      {...remainingProps}
    >
      <div className="l-logo-spinner__spinner" />
      <img className="l-logo-spinner__logo" src={logo} alt="Logo" />
    </div>
  );
}

LogoSpinner.propTypes = {
  logo: PropTypes.string,
  small: PropTypes.bool,
};

export default LogoSpinner;
