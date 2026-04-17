import React from 'react';
import PropTypes from 'prop-types';

import { Choice } from '~meetings/ui/choices';

function SurveyChoices({
  choices,
  onSelect,
  selectedIndices,
  formId,
}) {
  function choiceUi(choice, index) {
    return (
      <Choice
        key={index}
        className="m-v-5"
        index={index}
        isSelected={selectedIndices?.includes(index)}
        onSelect={onSelect}
        formId={formId}
        small
        text={choice}
      />
    );
  }

  return (
    <>
      {choices.map(choiceUi)}
    </>
  );
}

SurveyChoices.propTypes = {
  choices: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedIndices: PropTypes.array.isRequired,
};

export default SurveyChoices;
