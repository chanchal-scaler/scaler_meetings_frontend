import React, { useCallback } from 'react';

import {
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { Modal } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import {
  PROXY_QUESTION_MODAL_STATES,
} from '~meetings/utils/constants';
import analytics from '@common/utils/analytics';
import CustomQuestionForm from './CustomQuestionForm';
import TemplateQuestionForm from './TemplateQuestionForm';

const ModalContent = {
  [PROXY_QUESTION_MODAL_STATES.customQuestion]: CustomQuestionForm,
  [PROXY_QUESTION_MODAL_STATES.genericQuestion]: TemplateQuestionForm,
};

function LaunchProxyQuestionForm({ meetingStore: store }) {
  const { meeting } = store;
  const { proxyQuestion } = meeting;

  const { modalState } = proxyQuestion;

  const titleText = modalState === PROXY_QUESTION_MODAL_STATES.customQuestion
    ? 'Trigger a custom question' : 'Trigger a Question';

  const handleClose = useCallback(() => {
    proxyQuestion.toggleFormOpen();

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaProxyQuestionPopupCloseClick,
      click_source: DRONA_SOURCES.meetingProxyQuestionModal,
    });
  }, [proxyQuestion]);

  const UiContent = () => {
    const Content = ModalContent[modalState];

    if (Content) {
      return <Content />;
    } else {
      return null;
    }
  };

  return (
    <Modal
      isOpen={proxyQuestion.formOpen}
      onClose={handleClose}
      unMountOnClose
      headerClassName="m-proxy-question-form__header"
      className="m-proxy-question-form"
      containerClassName="m-proxy-question-form__body"
      title={
        (
          <div className="row align-c">
            {titleText}
          </div>
        )
      }
    >
      <UiContent />
    </Modal>
  );
}

export default mobxify('meetingStore')(LaunchProxyQuestionForm);
