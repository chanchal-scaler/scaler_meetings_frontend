import React, { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

function Expandable({
  anchorClassName,
  className,
  contentClassName,
  children,
  lessTriggerText,
  moreTriggerText,
  showMoreText,
  toggleHandler,
  unExpandedHeight = '10rem',
}) {
  const [isExpanded, setExpandableState] = useState(showMoreText);

  const toggleExpandable = () => {
    setExpandableState(!isExpanded);

    if (toggleHandler) {
      toggleHandler(isExpanded);
    }
  };

  function getAnchorText() {
    return isExpanded ? lessTriggerText : moreTriggerText;
  }

  return (
    <div
      className={classNames(
        'expandable',
        { [className]: className },
        { 'expandable--expanded': isExpanded },
      )}
    >
      <div
        className={classNames(
          'expandable__content',
          { [contentClassName]: contentClassName },
          { 'expandable--expanded': isExpanded },
        )}
        style={{ height: unExpandedHeight }}
      >
        {children}
      </div>
      <button
        data-testid="expand-button"
        type="button"
        className={classNames(
          'expandable__anchor',
          { [anchorClassName]: anchorClassName },
        )}
        onClick={toggleExpandable}
      >
        {getAnchorText()}
      </button>
    </div>
  );
}

Expandable.propTypes = {
  anchorClassName: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  lessTriggerText: PropTypes.string,
  moreTriggerText: PropTypes.string,
  showMoreText: PropTypes.bool,
  toggleHandler: PropTypes.func,
};

export default Expandable;
