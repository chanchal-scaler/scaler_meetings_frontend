import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import { Choice } from '~meetings/ui/choices';

function ProblemChoices({
  className,
  choices,
  isLocked,
  onSelect,
  selectedIndex,
  ...remainingProps
}) {
  const handleSelect = useCallback((choiceIndex) => {
    if (!isLocked) {
      onSelect(choiceIndex);
    }
  }, [isLocked, onSelect]);

  function choiceUi(choice, index) {
    return (
      <Choice
        key={index}
        className="m-5"
        index={index}
        isSelected={index === selectedIndex}
        onSelect={handleSelect}
        text={choice.answer}
      />
    );
  }

  return (
    <div
      className={classNames(
        'm-problem-choices',
        { [className]: className },
      )}
      {...remainingProps}
    >
      <div className="hint h5 m-b-10 text-c">
        {
          isLocked
            ? 'Waiting for others to complete the quiz'
            : 'Click on an option to submit your answer'
        }
      </div>
      <div className="m-problem-choices__list">
        {choices.map(choiceUi)}
      </div>
    </div>
  );
}

ProblemChoices.propTypes = {
  choices: PropTypes.array.isRequired,
  isLocked: PropTypes.bool,
  onSelect: PropTypes.func,
  selectedIndex: PropTypes.number,
};

export default observer(ProblemChoices);
