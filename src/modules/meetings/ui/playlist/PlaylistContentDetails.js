import React from 'react';
import classNames from 'classnames';

import { Avatar, Icon } from '@common/ui/general';
import { toCountdown } from '~video_player/utils/date';

function PlaylistContentDetails({
  className,
  component = 'div',
  description,
  duration,
  name,
  participant,
  showHint,
  ...remainingProps
}) {
  return React.createElement(
    component,
    {
      className: classNames(
        'm-asl-content',
        { [className]: className },
      ),
      ...remainingProps,
    },
    <>
      <div className="m-asl-content__left">
        <Avatar
          size={45}
          title={participant.name}
          image={participant.avatar}
        />
      </div>
      <div className="m-asl-content__center">
        {name && <h4 className="bolder dark no-mgn-b">{name}</h4>}
        {description && <p className="h6 m-t-5 no-mgn-b">{description}</p>}
      </div>
      {duration && (
        <div className="m-asl-content__right">
          <div className="row align-c">
            <Icon className="h6 no-mgn-b hint" name="clock" />
            <span className="h5 dark bolder no-mgn-b">
              {toCountdown(duration)}
            </span>
          </div>
        </div>
      )}
      {showHint && (
        <div className="m-asl-content__hint">
          Click to play
        </div>
      )}
    </>,
  );
}

export default PlaylistContentDetails;
