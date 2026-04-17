import React from 'react';

import { Choice } from '~meetings/ui/choices';

export default function ({
  index, numberOfQuestion, resultData,
}) {
  function choiceUi(choice, i) {
    const responseBreakup = resultData.response_distribution;
    const totalResponseCount = resultData.total_responses;
    const choiceCount = responseBreakup.filter(
      item => choice === item.title,
    )?.[0]?.count;
    let percent = 0;
    if (typeof choiceCount === 'number') {
      percent = (totalResponseCount / choiceCount) * 100;
    }
    return (
      <div
        key={i}
        className="m-survey-responses__item m-v-5"
      >
        <div className="m-survey-responses__choice m-r-5">
          <Choice
            distribution={percent}
            index={i}
            isResponse
            small
            text={choice}
          />
        </div>
        <div className="m-survey-responses__percent">
          {percent}
          %
        </div>
      </div>
    );
  }
  return (
    <div className="survey__result-list">
      <div className="survey__result-title">
        {`Question ${index + 1} of ${numberOfQuestion}`}
      </div>
      <br />
      <div className="survey__result-desc">{resultData?.description}</div>
      {
        resultData.form_type === 'dropdown'
          ? (
            <div className="m-survey-responses__list">
              {resultData?.meta?.options?.map(choiceUi)}
            </div>
          )
          : (
            <div className="survey__result-input">
              {resultData.total_responses}
              {' '}
              people answered
            </div>
          )
      }
    </div>
  );
}
