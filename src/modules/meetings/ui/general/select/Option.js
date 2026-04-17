import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { withGTMTracking } from '@common/ui/hoc';

function Option({
  className,
  isSelected,
  selectedClassName,
  small,
  value,
  ...remainingProps
}) {
  return (
    <div
      role="button"
      tabIndex={-1}
      className={classNames(
        'm-select-option',
        { 'm-select-option--selected': isSelected },
        { 'm-select-option--small': small },
        { [className]: className },
        { [selectedClassName]: selectedClassName && isSelected },
      )}
      {...remainingProps}
    />
  );
}

Option.propTypes = {
  selectedClassName: PropTypes.string,
};

export default withGTMTracking(Option);
