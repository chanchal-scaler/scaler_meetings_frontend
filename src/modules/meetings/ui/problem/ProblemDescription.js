import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { AdvancedMdRenderer } from '@common/ui/markdown';

function ProblemDescription({
  className,
  description,
  ...remainingProps
}) {
  return (
    <div
      className={classNames(
        'm-problem-description',
        { [className]: className },
      )}
      {...remainingProps}
    >
      <AdvancedMdRenderer
        className="m-problem-description__markdown"
        mdString={description}
        parseCode
        parseMathExpressions
      />
    </div>
  );
}

ProblemDescription.propTypes = {
  description: PropTypes.string.isRequired,
};

export default ProblemDescription;
