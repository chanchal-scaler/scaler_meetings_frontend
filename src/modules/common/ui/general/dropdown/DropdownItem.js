import { createElement, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { isFunction } from '@common/utils/type';
import * as CustomPropTypes from '@common/utils/propTypes';
import DropdownContext from './context';
import Tappable from '../Tappable';
import { withGTMTracking } from '@common/ui/hoc';

function DropdownItem({
  className,
  component = Tappable,
  onClick,
  ...remainingProps
}) {
  const { handleClose } = useContext(DropdownContext);
  const handleClick = useCallback((event) => {
    if (isFunction(onClick)) {
      onClick(event);
    }
    handleClose();
  }, [handleClose, onClick]);

  return createElement(
    component,
    {
      className: classNames(
        'dropdown-item',
        { [className]: className },
      ),
      onClick: handleClick,
      ...remainingProps,
    },
  );
}

DropdownItem.propTypes = {
  className: PropTypes.string,
  component: CustomPropTypes.componentPropType.isRequired,
  onClick: PropTypes.func,
};

export default withGTMTracking(DropdownItem);
