import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { MdRenderer } from '@common/ui/markdown';

function SurveyDescription({
  className,
  description,
  ...remainingProps
}) {
  return (
    <div
      className={classNames(
        'm-survey-description',
        { [className]: className },
      )}
      {...remainingProps}
    >
      <MdRenderer mdString={description} />
    </div>
  );
}

SurveyDescription.propTypes = {
  description: PropTypes.string.isRequired,
};

export default SurveyDescription;
