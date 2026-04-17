import React, { useCallback } from 'react';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { Icon, Tappable } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';

function CustomQuestionForm({ meetingStore: store }) {
  const { meeting } = store;
  const { proxyQuestion } = meeting;

  const {
    userName,
    question,
    isSendingDisabled,
    isFetchingUserName,
  } = proxyQuestion;

  const handleRandomizeName = useCallback(() => {
    proxyQuestion.fetchUserName();

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaProxyQuestionRandomiseNameClick,
      click_source: DRONA_SOURCES.meetingProxyQuestionModal,
      click_feature: DRONA_FEATURES.proxyCustomQuestion,
    });
  }, [proxyQuestion]);

  const handleSendProxyQuestion = useCallback(() => {
    proxyQuestion.sendProxyQuestion();

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaProxyQuestionSendCtaClick,
      click_source: DRONA_SOURCES.meetingProxyQuestionModal,
      click_feature: DRONA_FEATURES.proxyCustomQuestion,
      custom: {
        question,
        userName,
      },
    });
  }, [proxyQuestion, question, userName]);

  return (
    <>
      {!userName && (
        <label
          className="m-proxy-question-form-placeholder"
          htmlFor="m-proxy-question-form-username"
        >
          <Icon
            name="alphabet"
            className="m-proxy-question-form-placeholder__icon"
          />
          Enter Username
        </label>
      )}
      <input
        className="m-proxy-question-form-input"
        id="m-proxy-question-form-username"
        placeholder=""
        value={userName}
        onChange={(e) => proxyQuestion.setUserName(e.target.value)}
      />
      <Tappable
        className="btn btn-primary btn-outlined btn-rounded m-t-20"
        onClick={handleRandomizeName}
        disabled={isFetchingUserName}
      >
        <Icon name="swap" className="m-r-10" />
        Randomize
      </Tappable>
      {!question && (
        <label
          className="
            m-proxy-question-form-placeholder
            m-proxy-question-form-placeholder--description
          "
          htmlFor="m-proxy-question-form-description"
        >
          <Icon
            name="left-align"
            className="m-proxy-question-form-placeholder__icon"
          />
          Type the question here
        </label>
      )}
      <textarea
        type="text"
        required
        rows={5}
        id="m-proxy-question-form-description"
        onChange={(e) => proxyQuestion.setQuestion(e.target.value)}
        className="
          m-proxy-question-form-input m-proxy-question-form-input--description
        "
        value={question}
      />
      <Tappable
        className="btn btn-primary btn-large m-proxy-question-form__cta"
        disabled={isSendingDisabled}
        onClick={handleSendProxyQuestion}
      >
        Send
      </Tappable>
    </>
  );
}

export default mobxify('meetingStore')(CustomQuestionForm);
