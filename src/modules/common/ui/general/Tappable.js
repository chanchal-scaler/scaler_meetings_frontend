import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import compose from 'lodash/fp/compose';

import { forwardRef, withGTMTracking } from '@common/ui/hoc';

function Tappable({
  className,
  component,
  disabled,
  forwardedRef,
  ...remainingProps
}) {
  return React.createElement(
    component || 'a',
    {
      className: classNames(
        'tappable',
        { disabled },
        { [className]: className },
      ),
      ref: forwardedRef,
      ...remainingProps,
    },
  );
}

Tappable.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

const hoc = compose(
  forwardRef,
  withGTMTracking,
);

export default hoc(Tappable);
