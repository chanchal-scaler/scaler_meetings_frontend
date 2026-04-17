import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Progressbar from './Progressbar';

function MilestoneProgress({
  className,
  icon,
  header,
  body,
  progressValue,
  progressLimit,
  checkpoints,
  isVisible = true,
  // eslint-disable-next-line no-unused-vars
  ...remainingProps
}) {
  return isVisible ? (
    <div
      className={classNames(
        'milestone-progress',
        { [className]: className },
      )}
    >
      <div className="milestone-progress__icon">
        {icon}
      </div>
      <div className="milestone-progress__content">
        <div className="milestone-progress__content-header">{header}</div>
        <div className="mileStone-progress__content-body">{body}</div>
        <Progressbar
          className="milestone-progress__content-progress"
          value={progressValue}
          limit={progressLimit}
          checkpoints={checkpoints.splice(0, checkpoints.length - 1)}
        />
      </div>
    </div>
  ) : null;
}

MilestoneProgress.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.node.isRequired,
  header: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  progressValue: PropTypes.number.isRequired,
  progressLimit: PropTypes.number.isRequired,
  checkpoints: PropTypes.array.isRequired,
  isVisible: PropTypes.bool,
};

export default MilestoneProgress;
