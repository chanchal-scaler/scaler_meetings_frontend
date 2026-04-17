import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { Choice } from '~meetings/ui/choices';
import { AdvancedMdRenderer } from '@common/ui/markdown';

const DEFAULT_DESCRIPTION = 'Problem statement will be displayed here';

function ProblemPreview({
  choices,
  className,
  description,
}) {
  function choiceUi(choice, index) {
    return (
      <Choice
        key={index}
        className="m-v-5"
        index={index}
        text={choice.answer || `Option ${index + 1}`}
      />
    );
  }

  return (
    <div
      className={classNames(
        'problem-preview',
        { [className]: className },
      )}
    >
      <div className="problem-preview__description">
        <AdvancedMdRenderer
          className="problem-preview__markdown"
          mdString={description || DEFAULT_DESCRIPTION}
          parseCode
          parseMathExpressions
        />
      </div>
      <div className="bold hint">
        Chose the correct answer
      </div>
      <div className="problem-preview__choices">
        {choices.map(choiceUi)}
      </div>
    </div>
  );
}

export default observer(ProblemPreview);
