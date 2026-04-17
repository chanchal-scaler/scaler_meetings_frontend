import React from 'react';
import classNames from 'classnames';

function ArchiveContainer({ children, className }) {
  return (
    <div className={classNames(
      'layout',
      { [className]: className },
    )}
    >
      <div
        className="
          layout__content
          layout__content--transparent archive
        "
      >
        {children}
      </div>
    </div>
  );
}

export default ArchiveContainer;
