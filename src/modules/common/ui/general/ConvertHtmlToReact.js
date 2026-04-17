import React from 'react';
import PropTypes from 'prop-types';

function ConvertHtmlToReact({
  html, component, ...remainingProps
}) {
  return React.createElement(
    component || 'div',
    {
      dangerouslySetInnerHTML: { __html: html },
      ...remainingProps,
    },
  );
}

ConvertHtmlToReact.propTypes = {
  html: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ConvertHtmlToReact;
