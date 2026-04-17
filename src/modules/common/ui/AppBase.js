import React from 'react';
import PropTypes from 'prop-types';

import {
  Alert,
  Dialog,
  Toast,
  Snackbar,
  ErrorBoundary,
  StyleScope,
} from '@common/ui/general';
import HMRProgress from './general/HMRProgress';

function AppBase({
  children,
  renderSingletons = false,
  namespace,
  alertProps = {},
  dialogProps = {},
  onError,
  ...remainingProps
}) {
  return (
    <StyleScope {...remainingProps}>
      <ErrorBoundary onError={onError}>
        {children}
        {renderSingletons && (
          <>
            <Alert
              name={namespace}
              {...alertProps}
            />
            <Dialog
              name={namespace}
              {...dialogProps}
            />
            <Toast />
            <Snackbar />
          </>
        )}
        <HMRProgress />
      </ErrorBoundary>
    </StyleScope>
  );
}

AppBase.propTypes = {
  alertProps: PropTypes.object,
  dialogProps: PropTypes.object,
  namespace: PropTypes.string,
  renderSingletons: PropTypes.bool,
  onError: PropTypes.func,
};

export default AppBase;
