import React from 'react';
import classNames from 'classnames';

function MainContainer({ children, className, ...remainingProps }) {
  return (
    <div
      className={classNames(
        'archive-main',
        { [className]: className },
      )}
      {...remainingProps}
    >
      {children}
    </div>
  );
}

export default MainContainer;
