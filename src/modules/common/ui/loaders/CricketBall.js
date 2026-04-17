import React from 'react';
import classNames from 'classnames';

import cricketBall from '@common/images/gif/cricket-ball.gif';

function CricketBall({ className, small = false, ...remainingProps }) {
  return (
    <div
      className={classNames(
        'l-cricket-ball',
        { 'l-cricket-ball--small': small },
        { [className]: className },
      )}
      {...remainingProps}
    >
      <img
        alt="Cricket ball"
        className="l-cricket-ball__img"
        src={cricketBall}
      />
    </div>
  );
}

export default CricketBall;
