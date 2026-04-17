import React, { useCallback } from 'react';
import { toJS } from 'mobx';

import {
  DRONA_FEATURES, DRONA_TRACKING_TYPES,
  DRONA_SOURCES,
} from '~meetings/utils/trackingEvents';
import { Field } from '@common/ui/form';
import { mobxify } from '~meetings/ui/hoc';
import {
  RadioButton, RadioGroup, Tappable,
} from '@common/ui/general';
import { LoadingLayout } from '@common/ui/layouts';
import analytics from '@common/utils/analytics';
import BannerListTemplate from './templates/BannerListTemplate';
import BannerListTemplateInput from './templates/BannerListTemplateInput';
import NoticeBoardMemo from '~meetings/models/noticeBoardMemo';

function NoticeBoardFormTemplates(
  { meetingStore: store, onClose },
) {
  const { meeting } = store;
  const { noticeBoard } = meeting;

  const handlePin = useCallback(() => {
    noticeBoard.pinCustomMessage(noticeBoard.currentTemplate);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardPinMessageTemplateClick,
      click_source: DRONA_SOURCES.meetingNoticeBoardModal,
      click_feature: DRONA_FEATURES.noticeBoard,
      custom: noticeBoard.currentTemplate || {},
    });
  }, [noticeBoard]);

  const handleChange = useCallback((event) => {
    noticeBoard.setCurrentTemplateSlug(event.target.value);
  }, [noticeBoard]);

  const messageObj = new NoticeBoardMemo(meeting, {
    fromId: '1',
    createdAt: Date.now(),
    body: JSON.stringify(noticeBoard.currentTemplate),
    toId: String(-1),
    pinId: String(-1),
  });

  return (
    <>
      <div className="m-notice-board-form-templates__container">
        {noticeBoard.isLoadingTemplates ? <LoadingLayout isFit />
          : (
            <>
              <Field
                label="Select a template"
                className="m-notice-board-form-templates__container--left"
                labelClassName="m-notice-board-form-templates__label"
              >
                <RadioGroup
                  name="noticeBoardTemplates"
                  onChange={handleChange}
                  value={noticeBoard.currentTemplateSlug}
                >
                  {toJS(noticeBoard.templates).map((template, index) => (
                    <RadioButton
                      key={index}
                      textClassName="m-notice-board-form-templates__radio"
                      name={template.slug}
                      text={template.title}
                    />
                  ))}
                </RadioGroup>
              </Field>
              <div className="m-notice-board-form-templates__container--right">
                <div className="m-notice-board-form-templates__preview">
                  {messageObj.body
                    ? (
                      <BannerListTemplate
                        message={messageObj}
                      />
                    ) : (
                      <div
                        className="m-notice-board-form-templates__placeholder"
                      >
                        Select a template to preview
                      </div>
                    )}
                </div>
                <BannerListTemplateInput />
              </div>
            </>
          )}
      </div>
      <div className="m-notice-board-form-footer">
        <Tappable
          onClick={onClose}
          className="btn btn-long btn-primary m-r-15
           btn-outlined m-notice-board-form-input"
        >
          Close
        </Tappable>
        <Tappable
          disabled={!noticeBoard.currentTemplate}
          onClick={handlePin}
          className="btn btn-long btn-primary m-notice-board-form-input"
        >
          Pin Message
        </Tappable>
      </div>
    </>
  );
}

export default mobxify(
  'meetingStore',
)(NoticeBoardFormTemplates);
