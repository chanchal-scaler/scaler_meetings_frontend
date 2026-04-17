import React, { useCallback, useEffect } from 'react';

import { dialog } from '@common/ui/general/Dialog';
import { Icon, Tappable } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import { TimeElapsed } from '~meetings/ui/general';
import SurveyChoices from './SurveyChoices';
import SurveyDescription from './SurveyDescription';
import AsyncSelect from '~meetings/ui/input/AsyncSelect';
import TextInput from '~meetings/ui/input/TextInput';
import NumberInput from '~meetings/ui/input/NumberInput';

const FETCH_COMPANY_URL = '/academy/get-companies?format=0&q=';

function Survey({ meetingStore: store }) {
  const { meeting } = store;
  const { manager } = meeting;
  const { survey } = manager;

  useEffect(() => {
    if (survey.isResultPublished || (survey.isEnded && !survey.isPublisher)) {
      manager.dropSurvey();
    }
  }, [manager, survey.isEnded, survey.isPublisher, survey.isResultPublished]);

  const handleEnd = useCallback(() => {
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content: 'Proceeding will end the survey even before the timer ends for '
        + 'all audience',
      onOk: () => survey.endOnServer(),
    });
  }, [survey]);

  const getCompanyUrl = useCallback(keyword => FETCH_COMPANY_URL + keyword, []);

  function hostActionUi() {
    if (!survey.isEndedOnServer) {
      return (
        <div className="text-c h5">
          {/* eslint-disable-next-line */}
          <a
            className="link"
            onClick={handleEnd}
          >
            End survey now
          </a>
        </div>
      );
    } else {
      return null;
    }
  }

  function formUi() {
    const currentSurveyField = survey.data?.forms?.[survey.currentFieldIndex];
    const initilizedField = survey.initializeField(currentSurveyField);
    if (initilizedField.fieldData?.type === 'dropdown') {
      return (
        <>
          <h5 className="bold hint m-t-5">
            {initilizedField.fieldData.description}
          </h5>
          <SurveyChoices
            choices={initilizedField.fieldData.choices}
            onSelect={initilizedField.onSelectValue}
            selectedIndices={initilizedField.myChoiceIndices}
          />
        </>
      );
    } else if (initilizedField.fieldData?.type === 'async_dropdown') {
      return (
        <>
          <h5 className="bold hint m-t-5">
            {initilizedField.fieldData?.description}
          </h5>
          <AsyncSelect
            onChange={initilizedField.onSelectValue}
            className="survey__async"
            lebel="Search company"
            getUrl={getCompanyUrl}
          />
        </>
      );
    } else if (initilizedField.fieldData?.type === 'number') {
      return (
        <>
          <h5 className="bold hint m-t-5">
            {initilizedField.fieldData?.description}
          </h5>
          <NumberInput
            inputChange={initilizedField.onSelectValue}
            value={initilizedField.formResponse}
            className="survey__input survey__number-input"
            maxLength={initilizedField.fieldData?.maxLength || 2}
            placeholder="| Year"
          />
        </>
      );
    } else {
      return (
        <>
          <h5 className="bold hint m-t-5">
            {initilizedField.fieldData?.description}
          </h5>
          <TextInput
            inputChange={initilizedField.onSelectValue}
            value={initilizedField.formResponse}
            className="survey__input"
          />
        </>
      );
    }
  }

  function mainUi() {
    if (!meeting.isSuperHost) {
      return (
        <div className="m-survey__main">
          {formUi()}
          <Tappable
            className="btn btn-primary btn-small full-width m-v-5 m-sticky"
            disabled={!survey.canSubmit()}
            onClick={() => survey.submit()}
          >
            Submit
          </Tappable>
          {survey.isSubmitted && (
            <div className="m-survey__submission">
              <Icon className="h3 m-b-5 success" name="tick" />
              <div className="bold dark">
                Sucessfully submitted!
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="m-survey__main">
          {hostActionUi()}
        </div>
      );
    }
  }

  return (
    <div className="m-survey">
      <TimeElapsed
        duration={survey.duration}
        timeElapsed={survey.timeElapsed}
      />
      {survey.canClose && (
        <Tappable
          className="btn btn-round btn-small m-survey__close"
          onClick={manager.dropSurvey}
        >
          <Icon name="clear" />
        </Tappable>
      )}
      <SurveyDescription
        className="m-b-5"
        description={survey.description}
      />
      {mainUi()}
    </div>
  );
}

export default mobxify('meetingStore')(Survey);
