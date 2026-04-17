import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { componentPropType } from '@common/utils/propTypes';

function Tab({
  tabName,
  title,
  component = 'div',
  children,
  className,
  isRightAligned = false,
  ...remainingProps
}) {
  return React.createElement(
    component,
    {
      className: classNames(
        'tabs__tab-content',
        { [className]: className },
      ),
      ...remainingProps,
    },
    children,
  );
}

Tab.propTypes = {
  tabName: PropTypes.string.isRequired,
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  component: componentPropType,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  isRightAligned: PropTypes.bool,
};

export default Tab;
