import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { forwardRef } from '@common/ui/hoc';

function Icon({
  forwardedRef,
  name,
  className,
  prefix = 'icon',
  ...remainingProps
}) {
  return (
    <i
      ref={forwardedRef}
      className={classNames(
        `${prefix}-${name}`,
        { [className]: className },
      )}
      {...remainingProps}
    />
  );
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default forwardRef(Icon);
