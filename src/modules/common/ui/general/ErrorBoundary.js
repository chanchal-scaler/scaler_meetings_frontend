import React, { Component } from 'react';

import HintLayout from '@common/ui/layouts/HintLayout';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';

const initialState = { error: null };

class ErrorBoundary extends Component {
  static getDerivedStateFromError(error) {
    return { error };
  }

  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentDidCatch(error, info) {
    const { onError } = this.props;
    if (onError) onError(error, info);
  }

  refreshPage = () => window.location.reload();

  render() {
    const { error } = this.state;
    const { fallback, children } = this.props;

    if (error !== null) {
      if (React.isValidElement(fallback)) {
        return fallback;
      } else {
        return (
          <HintLayout
            message="Something went wrong!"
            actionLabel="Try again"
            actionFn={this.refreshPage}
          />
        );
      }
    }
    return children;
  }
}

const ErrorBoundaryWrapper = ({ children, ...props }) => (
  <SentryErrorBoundary
    fallback={<ErrorBoundary {...props}>{children}</ErrorBoundary>}
  >
    {children}
  </SentryErrorBoundary>
);


export default ErrorBoundaryWrapper;
