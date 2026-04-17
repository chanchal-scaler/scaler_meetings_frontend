import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function Tile({
  component = Link,
  className,
  title,
  children,
  ...remainingProps
}) {
  return React.createElement(
    component,
    {
      className: classNames(
        'admin-tile',
        { [className]: className },
      ),
      ...remainingProps,
    },
    <>
      <div className="admin-tile__title">
        {title}
      </div>
      <div className="admin-tile__body">
        {children}
      </div>
    </>,
  );
}

Tile.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  title: PropTypes.node.isRequired,
};

export default Tile;
