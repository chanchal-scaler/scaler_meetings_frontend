import React, { useCallback } from 'react';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { dialog } from '@common/ui/general/Dialog';
import { mobxify } from '~meetings/ui/hoc';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import { Tappable, Textarea } from '@common/ui/general';
import { toast } from '@common/ui/general/Toast';
import { toCountdown } from '~video_player/utils/date';
import { useMediaQuery } from '@common/hooks';
import HotKey from '@common/lib/hotKey';
import { sendSubmitGTMEvent } from '@common/utils/gtm';
import analytics from '@common/utils/analytics';

function QuestionInput({ meetingStore: store }) {
  const { tablet } = useMediaQuery();
  const { meeting } = store;
  const { manager } = meeting;

  const handleSubmit = useCallback(() => {
    if (meeting.isCreatingQuestion) return;

    if (meeting.isValidQuestion) {
      sendSubmitGTMEvent('question', {
        lengthOfInput: meeting.questionInput.length,
        action: 'input_submit',
        category: 'drona',
      });
      analytics.click({
        click_type: DRONA_TRACKING_TYPES.dronaAskQuestionButtonClick,
        click_source: DRONA_SOURCES.meetingQuestionInput,
      });
      dialog.show({
        name: SINGLETONS_NAME,
        title: 'Are you sure?',
        content: 'Proceeding will post with this question. Make sure that'
          + ' you\'ve reviewed your question',
        okLabel: 'Yes, Post Question',
        cancelLabel: 'No, Cancel',
        onOk: () => {
          meeting.createQuestion();
          analytics.click({
            click_type: DRONA_TRACKING_TYPES.dronaPostQuestionButtonClick,
            click_source: DRONA_SOURCES.meetingQuestionInput,
            click_feature: DRONA_FEATURES.questions,
            custom: {
              confirm_post_button: 'Yes, Post Question',
            },
          });
        },
        onCancel: () => {
          analytics.click({
            click_type: DRONA_TRACKING_TYPES.dronaPostQuestionButtonClick,
            click_source: DRONA_SOURCES.meetingQuestionInput,
            click_feature: DRONA_FEATURES.questions,
            custom: {
              confirm_post_button: 'No, Cancel',
            },
          });
        },
        gtmData: {
          eventName: 'question',
          action: 'input_submit',
          category: 'drona',
          lengthOfInput: meeting.questionInput.length,
        },
        okClass: 'btn-primary',
      });
    } else {
      toast.show({
        message: 'Question too small!',
        type: 'warning',
      });
    }
  }, [meeting]);

  const handleKeyDown = useCallback((event) => {
    const hotKey = new HotKey(event);
    if (hotKey.didPress('enter') && !hotKey.didPress('shift+enter')) {
      event.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  if (!meeting.isSuperHost) {
    const { isChatDisabled, isQuestionsDisabled } = manager;
    if (isChatDisabled || isQuestionsDisabled) {
      return (
        <div className="mq-input mq-input--disabled">
          Questions has been disabled by host
        </div>
      );
    } else {
      return (
        <div className="mq-input">
          <Textarea
            autoFocus={!tablet}
            className="mq-input__textarea"
            gtmEventType="question_input"
            gtmEventAction="focus"
            gtmEventCategory="drona"
            onChange={(event) => meeting.setQuestionInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              meeting.canAskQuestion
                ? 'Type your question'
                : `Type next question in `
                + `${toCountdown(meeting.questionRateLimitCountDown)}`
            }
            type="text"
            value={meeting.questionInput}
            maxRows={3}
            disabled={!meeting.canAskQuestion}
          />
          <Tappable
            className="
              btn btn-smal btn-inverted btn-primary bold mq-input__action
            "
            disabled={meeting.isCreatingQuestion || !meeting.canAskQuestion}
            onClick={handleSubmit}
          >
            Ask
          </Tappable>
        </div>
      );
    }
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(QuestionInput);
