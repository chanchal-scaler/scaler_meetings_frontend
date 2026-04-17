import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import pluralize from 'pluralize';
import classNames from 'classnames';

import { Choice } from '~meetings/ui/choices';
import { Icon } from '@common/ui/general';
import { isNullOrUndefined } from '@common/utils/type';

function ProblemResponses({
  choices,
  className,
  correctIndex,
  distribution,
  selectedIndex,
  totalResponses = 0,
  hideDistribution = false,
  ...remainingProps
}) {
  function choiceUi(choice, index) {
    const percent = distribution[index];
    const isSelected = index === selectedIndex;
    const isCorrect = index === correctIndex;
    const isWrong = (
      isSelected
      && !isNullOrUndefined(correctIndex)
      && (correctIndex > -1)
      && (index !== correctIndex)
    );

    return (
      <div
        key={index}
        className="m-problem-responses__item m-v-5"
      >
        <div
          className={classNames(
            'm-problem-responses__indicator',
            { 'm-problem-responses__indicator--correct': isCorrect },
            { 'm-problem-responses__indicator--wrong': isWrong },
          )}
        >
          {isCorrect && (
            <Icon name="check" />
          )}
          {isWrong && (
            <Icon name="clear" />
          )}
        </div>
        <div className="m-problem-responses__choice m-h-5">
          <Choice
            distribution={hideDistribution ? 0 : percent}
            isCorrect={isCorrect}
            index={index}
            isResponse
            isSelected={isSelected}
            isWrong={isWrong}
            text={choice.answer}
          />
        </div>
        {!hideDistribution && (
          <div className="m-problem-responses__percent">
            {percent}
            %
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'm-problem-responses',
        { [className]: className },
      )}
      {...remainingProps}
    >
      {!hideDistribution && (
        <div className="h5 hint m-b-10 text-c">
          {totalResponses}
          {' '}
          {pluralize('user', totalResponses)}
          {' '}
          {pluralize('have', totalResponses)}
          {' '}
          participated
        </div>
      )}
      <div className="m-problem-responses__list">
        {choices.map(choiceUi)}
      </div>
    </div>
  );
}

ProblemResponses.propTypes = {
  choices: PropTypes.array.isRequired,
  correctIndex: PropTypes.number,
  distribution: PropTypes.array.isRequired,
  selectedIndex: PropTypes.number,
  totalResponses: PropTypes.number,
  hideDistribution: PropTypes.bool,
};

export default observer(ProblemResponses);
