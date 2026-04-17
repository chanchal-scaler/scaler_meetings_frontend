import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function Timeline({
  header,
  children,
  className,
}) {
  return (
    <div className={classNames(
      'timeline',
      { [className]: className },
    )}
    >
      <div className={classNames(
        'timeline__header',
        `${className}__header`,
      )}
      >
        {header}
      </div>
      {children && (
        <div className="timeline__children">
          <div className="timeline__content p-20">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

Timeline.propTypes = {
  header: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.number,
  ]).isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Timeline;
