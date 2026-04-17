import React from 'react';

import { Icon, Tappable } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import SurveyResponses from './SurveyResponses';


function SurveyPreview({ surveyStore: store }) {
  function headerUi() {
    return (
      <div className="mcq-preview__header survey__header">
        <h3 className="bold dark m-b-10">Survey Results</h3>
      </div>
    );
  }
  function bodyUi() {
    if (store.surveyResults?.length) {
      return store.surveyResults?.map((item, index) => (
        <SurveyResponses
          index={index}
          resultData={item.attributes}
          numberOfQuestion={store.surveyResults?.length}
        />
      ));
    } else {
      return (
        <div className="mcq-preview__hint hint">
          Click on View Results once the User Survey is launched.
        </div>
      );
    }
  }
  function footerUi() {
    return (
      <div className="mcq-preview__footer layout__footer">
        <Tappable
          className="mcq-preview__toggle flex-row hint"
          onClick={() => store.setPreviewOpen(false)}
        >
          <span className="flex-fill m-r-10">
            Minimize
          </span>
          <Icon name="chevron-right" />
        </Tappable>
      </div>
    );
  }
  return (
    <div className="mcq-preview layout">
      <div className="layout__content mcq-preview__content survey__content">
        {headerUi()}
        {bodyUi()}
      </div>
      {footerUi()}
    </div>
  );
}
export default mobxify('surveyStore')(SurveyPreview);
