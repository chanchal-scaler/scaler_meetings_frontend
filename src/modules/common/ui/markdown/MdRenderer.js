import React, { useMemo } from 'react';
import classNames from 'classnames';

import { mdToHtml } from './mdToHtml';

// TODO Add styling later
function MdRenderer({ className, mdString, options = {} }) {
  // Why using memo? Because parsing markdown can be expensive and we don't
  // want to parse `mdString` on every render
  const parsedString = useMemo(
    () => ({ __html: mdToHtml(mdString, options) }),
    [mdString, options],
  );

  return (
    <div
      className={classNames(
        'md-renderer',
        { [className]: className },
      )}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={parsedString}
    />
  );
}

export default MdRenderer;
