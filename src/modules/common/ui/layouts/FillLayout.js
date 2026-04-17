import React from 'react';
import PropTypes from 'prop-types';

const fillTypes = ['block', 'flex-fill', 'flex-auto', 'custom'];

/**
 * A layout that is used to just to fill some empty space.
 */
function FillLayout({ type, height }) {
  switch (type) {
    case 'block':
      return <div style={{ height: '100%' }} />;
    case 'flex-fill':
      return <div style={{ flex: '1 0 0' }} />;
    case 'flex-auto':
      return <div style={{ flex: '1 0 auto' }} />;
    default:
      return <div style={{ height }} />;
  }
}

FillLayout.propTypes = {
  type: PropTypes.oneOf(fillTypes),
  height: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
};

export default FillLayout;
