import React from 'react';

export default function forwardRef(Component) {
  return React.forwardRef(
    (props, ref) => <Component {...props} forwardedRef={ref} />,
  );
}
