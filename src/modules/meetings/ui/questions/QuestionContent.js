import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { compose } from 'lodash/fp';
import { DISABLE_HTML_REMARKABLE_OPTIONS } from '@common/utils/remarkable';
import { forwardRef } from '@common/ui/hoc';
import { MdRenderer } from '@common/ui/markdown';
import { QuestionStatus } from '~meetings/utils/question';

function QuestionContent({
  forwardedRef,
  question,
  parentClassName,
  areActionsOpen,
  deleteActionUi,
  moreActionsUi,
  actionUi,
  timeUi,
  upvotesUi,
  ...remainingProps
}) {
  const { meeting } = question;

  const isProxyIndicatorVisible = (
    meeting.isSuperHost
    && question.isProxyQuestion
  );

  return (
    <div
      ref={forwardedRef}
      className={classNames(
        'm-question',
        { 'm-question--ongoing': question.status === QuestionStatus.ongoing },
        {
          'm-question--pending': (
            meeting.isSuperHost
            && question.status === QuestionStatus.pending
          ),
        },
        {
          'm-question--completed': question.isCompleted,
        },
        { [parentClassName]: parentClassName },
      )}
      {...remainingProps}
    >
      <div
        className={classNames(
          'm-question__card',
          { 'm-question__card--active': areActionsOpen },
        )}
      >
        <div className="m-question__header">
          <div
            className={classNames(
              'm-question__asker bolder dark',
              { 'm-question__asker--proxy': isProxyIndicatorVisible },
            )}
          >
            {question.isMine ? 'Your Question' : question.userName}
          </div>
          {deleteActionUi()}
          {moreActionsUi()}
        </div>
        <div className="m-question__body">
          <MdRenderer
            options={DISABLE_HTML_REMARKABLE_OPTIONS}
            mdString={question.body}
          />
        </div>
        {actionUi()}
      </div>
      <div className="m-question__footer">
        {timeUi()}
        {upvotesUi()}
      </div>
    </div>
  );
}

const hoc = compose(
  forwardRef,
  observer,
);

export default hoc(QuestionContent);
