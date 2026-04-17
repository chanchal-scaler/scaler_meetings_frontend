import React from 'react';
import classNames from 'classnames';

import {
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import {
  Icon, Tappable,
} from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { PROXY_QUESTION_MODAL_STATES } from '~meetings/utils/constants';
import analytics from '@common/utils/analytics';

function TemplateQuestionForm({ meetingStore: store }) {
  const { meeting } = store;
  const { proxyQuestion } = meeting;

  const handleTabChange = (value) => {
    proxyQuestion.setModalState(value);

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaProxyQuestionTabChangeClick,
      click_source: DRONA_SOURCES.meetingProxyQuestionModal,
      custom: {
        currentTab: value,
      },
    });
  };

  return (
    <div className="flex flex-col m-proxy-question-form-template">
      <Tappable
        className={classNames(
          'btn btn-primary btn-long btn-outlined btn-rounded',
          'm-proxy-question-form-template__custom_message_cta',
        )}
        onClick={() => handleTabChange(
          PROXY_QUESTION_MODAL_STATES.customQuestion,
        )}
      >
        Create a Custom Question
        <Icon name="pencil" />
      </Tappable>
    </div>
  );
}

export default mobxify('meetingStore')(TemplateQuestionForm);
