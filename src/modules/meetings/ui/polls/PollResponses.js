import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import pluralize from 'pluralize';

import { Choice } from '~meetings/ui/choices';

function PollResponses({
  choices,
  className,
  distribution,
  participationCount,
  totalResponses,
  small = true,
  ...remainingProps
}) {
  const maxPercent = Math.max(...distribution);

  function choiceUi(choice, index) {
    const percent = distribution[index];
    return (
      <div
        key={index}
        className="m-poll-responses__item m-v-5"
      >
        <div className="m-poll-responses__choice m-r-5">
          <Choice
            distribution={percent}
            index={index}
            isHighlighted={percent > 0 && percent === maxPercent}
            isResponse
            small={small}
            text={choice}
          />
        </div>
        <div className="m-poll-responses__percent">
          {percent}
          %
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'm-poll-responses',
        { 'm-poll-responses--small': small },
        { [className]: className },
      )}
      {...remainingProps}
    >
      <div className="h5 hint m-b-10 text-c">
        {totalResponses}
        {' '}
        {pluralize('response', totalResponses)}
        {' from '}
        {participationCount}
        {' '}
        {pluralize('user', participationCount)}
      </div>
      <div className="m-poll-responses__list">
        {choices.map(choiceUi)}
      </div>
    </div>
  );
}

PollResponses.propTypes = {
  choices: PropTypes.array.isRequired,
  distribution: PropTypes.array.isRequired,
  participationCount: PropTypes.number,
  totalResponses: PropTypes.number,
};

export default observer(PollResponses);
