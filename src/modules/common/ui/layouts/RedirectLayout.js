import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Tappable from '@common/ui/general/Tappable';

function RedirectLayout({
  isFit,
  isTransparent,
  message,
  redirectLabel,
  redirectTo,
  replace = false,
}) {
  return (
    <div className="layout">
      <div
        className={classNames(
          'layout__content layout__content--centered p-10',
          { 'layout__content--fit': isFit },
          { 'layout__content--transparent': isTransparent },
        )}
      >
        <p className="text-c">{message}</p>
        {redirectLabel && redirectTo && (
          <Tappable
            className="btn btn-primary"
            component={Link}
            to={redirectTo}
            replace={replace}
          >
            {redirectLabel}
          </Tappable>
        )}
      </div>
    </div>
  );
}

RedirectLayout.propTypes = {
  isFit: PropTypes.bool,
  isTransparent: PropTypes.bool,
  message: PropTypes.string.isRequired,
  redirectLabel: PropTypes.string,
  redirectTo: PropTypes.string,
  replace: PropTypes.bool.isRequired,
};

export default RedirectLayout;
