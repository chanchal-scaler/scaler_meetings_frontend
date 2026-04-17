import React from 'react';
import classNames from 'classnames';

export default function Divider({
  className,
  height,
}) {
  return (
    // namescpacing, as this is used elsewhere too
    <div
      className={classNames(
        'cm-divider',
        { [className]: className },
      )}
      style={{ height }}
    />
  );
}
