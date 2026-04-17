import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Tappable } from '@common/ui/general';
import { MdRenderer } from '@common/ui/markdown';
import { mobxify } from '~meetings/ui/hoc';

function TemplateTrailer({
  className,
  survey,
  duration,
  surveyStore: store,
}) {
  const { name, forms } = survey;
  function headerUi() {
    return (
      <div className="mcq-trailer__header">
        <div className="mcq-trailer__title">
          {name}
        </div>
      </div>
    );
  }
  function publishUi() {
    if (store.isLive) {
      return (
        <Tappable
          className="btn btn-danger m-btn-cta m-r-10"
          disabled={store.isSubmitting}
          onClick={() => store.publishTemplate(survey)}
        >
          Launch Now
        </Tappable>
      );
    } else {
      return null;
    }
  }
  function resultUi() {
    if (store.isLive) {
      return (
        <Tappable
          className="btn m-btn-cta m-r-10"
          disabled={!store.launchedSurveyId}
          onClick={() => store.getSurveyResluts(survey)}
        >
          View Result
        </Tappable>
      );
    } else {
      return null;
    }
  }
  function bodyUi() {
    return (
      <div className="mcq-trailer__body mcq-trailer__body--with-controls">
        {
          forms?.map(
            (item, index) => <div>{`${index + 1}. ${item.description}`}</div>
          )
        }
        <br />
        <MdRenderer
          className="dark bold"
          mdString={survey.description}
        />
        <div className="hint bold m-b-20">
          <span>
            {forms?.length}
            {' '}
            questions
          </span>
          <span className="p-h-5">|</span>
          <span>
            Active for:
            {' '}
            {duration}
            {' '}
            seconds
          </span>
          {survey.type === 'checkbox' && (
            <>
              <span className="p-h-5">|</span>
              <span>Multiselect</span>
            </>
          )}
        </div>
        <div className="row flex-ac">
          {publishUi()}
          {resultUi()}
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'mcq-trailer',
        { [className]: classNames },
      )}
    >
      {headerUi()}
      {bodyUi()}
    </div>
  );
}

TemplateTrailer.propTypes = {
  survey: PropTypes.object.isRequired,
};

export default mobxify('surveyStore')(TemplateTrailer);
