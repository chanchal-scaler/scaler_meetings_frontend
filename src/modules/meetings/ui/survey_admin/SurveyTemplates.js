import React from 'react';

import { HintLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import TemplateTrailer from './TemplateTrailer';

const SURVEY_TIME_PER_FORM = 30;

function SurveyList({ surveyStore: store }) {
  function itemUi(survey) {
    return (
      <TemplateTrailer
        key={survey.name}
        className="m-v-10"
        survey={survey}
        duration={survey.forms.length * SURVEY_TIME_PER_FORM}
      />
    );
  }

  if (store.templateCount > 0) {
    return (
      <div className="mcq-hq-list">
        {store.templates.map(itemUi)}
      </div>
    );
  } else {
    return (
      <HintLayout
        message="There are no templates available"
      />
    );
  }
}

export default mobxify('surveyStore')(SurveyList);
