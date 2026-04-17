import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { AdvancedMdRenderer } from '@common/ui/markdown';

function PollDescription({
  className,
  description,
  ...remainingProps
}) {
  return (
    <div
      className={classNames(
        'm-poll-description',
        { [className]: className },
      )}
      {...remainingProps}
    >
      <AdvancedMdRenderer
        mdString={description}
        parseCode
        parseMathExpressions
      />
    </div>
  );
}

PollDescription.propTypes = {
  description: PropTypes.string.isRequired,
};

export default PollDescription;
