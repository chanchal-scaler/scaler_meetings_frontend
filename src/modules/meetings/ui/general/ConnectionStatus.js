import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Tappable } from '@common/ui/general';
import ChatgptIcon from '~meetings/images/chatgpt-icon.svg';

const statusTypes = ['info', 'error'];

function ConnectionStatus({
  actionFn,
  actionLabel,
  className,
  guideUrl,
  message,
  type = 'info',
}) {
  return (
    <div
      className={classNames(
        'm-connection',
        `m-connection--${type}`,
        { [className]: className },
      )}
    >
      <div className="m-connection__message">
        {message}
      </div>
      {actionLabel && actionFn && (
        <div className="m-connection__action">
          <Tappable
            className="btn btn-small btn-light"
            onClick={actionFn}
          >
            {actionLabel}
          </Tappable>
        </div>
      )}
      {guideUrl && (
        <div className="m-connection__action">
          <Tappable
            className="btn btn-small btn-light m-connection__guide-btn"
            href={guideUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={ChatgptIcon}
              alt=""
              className="m-connection__guide-btn-icon"
            />
            Ask AI
          </Tappable>
        </div>
      )}
    </div>
  );
}

ConnectionStatus.propTypes = {
  actionFn: PropTypes.func,
  actionLabel: PropTypes.string,
  className: PropTypes.string,
  guideUrl: PropTypes.string,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(statusTypes).isRequired,
};

export default ConnectionStatus;
