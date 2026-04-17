import React from 'react';
import classNames from 'classnames';

/**
 * Use iso alpha 2 country code to render flag of that country code.
 * refer https://www.iso.org/obp/ui/ for country codes
 */
function Flag({ className, countryCode, ...remainingProps }) {
  return (
    <span
      className={classNames(
        'iti__flag',
        `iti__${countryCode.toLowerCase()}`,
        `${className}`,
      )}
      {...remainingProps}
    />
  );
}

export default Flag;
