import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';

import { Choice } from '~meetings/ui/choices';

function PollChoices({
  choices,
  onSelect,
  selectedIndices,
  small = true,
}) {
  function choiceUi(choice, index) {
    return (
      <Choice
        key={index}
        className="m-v-5"
        index={index}
        isSelected={selectedIndices.includes(index)}
        onSelect={onSelect}
        small={small}
        text={choice}
      />
    );
  }

  return (
    <div
      className={classNames(
        'm-poll-choices', { 'm-poll-choices--small': small },
      )}
    >
      <div className="m-poll-choices__list">
        {choices.map(choiceUi)}
      </div>
    </div>
  );
}

PollChoices.propTypes = {
  choices: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedIndices: PropTypes.array.isRequired,
};

export default PollChoices;
