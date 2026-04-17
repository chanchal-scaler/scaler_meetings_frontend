import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';

import { isString } from '@common/utils/type';

function SafeRedirect({ to, ...remainingProps }) {
  const { search } = useLocation();
  const baseTo = isString(to) ? { pathname: to } : to;

  return (
    <Navigate
      {...remainingProps}
      replace
      to={{
        ...baseTo,
        search: baseTo.search || search,
      }}
    />
  );
}

SafeRedirect.propTypes = {
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

export default SafeRedirect;
