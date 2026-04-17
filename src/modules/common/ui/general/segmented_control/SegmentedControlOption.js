import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { isFunction } from '@common/utils/type';
import { withGTMTracking } from '@common/ui/hoc';

function SegmentedControlOption({
  children,
  className,
  isActive,
  name,
  onChange,
  onClick,
  activeClassName,
  ...remainingProps
}) {
  const handleClick = useCallback((event) => {
    onChange(name);
    if (isFunction(onClick)) {
      onClick(event);
    }
  }, [name, onChange, onClick]);

  return (
    <button
      className={classNames(
        'segmented-control-option',
        { [className]: className },
        { 'segmented-control-option--active': isActive },
        { [activeClassName]: isActive && activeClassName },
      )}
      onClick={handleClick}
      type="button"
      {...remainingProps}
    >
      {
        isFunction(children)
          ? children({ isActive })
          : children
      }
    </button>
  );
}

SegmentedControlOption.propTypes = {
  className: PropTypes.string,
  isActive: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

export default withGTMTracking(SegmentedControlOption);
