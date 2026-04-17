import React, { useCallback } from 'react';
import { mobxify } from '~meetings/ui/hoc';

function BannerListTemplateInput({ meetingStore: store }) {
  const { meeting } = store;
  const { noticeBoard } = meeting;

  const handleUpdateCtaText = useCallback((event) => {
    noticeBoard.updateTemplate(
      noticeBoard.currentTemplateSlug,
      { ...noticeBoard.currentTemplate, cta_text: event.target.value },
    );
  }, [noticeBoard]);

  const handleUpdateCtaUrl = useCallback((event) => {
    noticeBoard.updateTemplate(
      noticeBoard.currentTemplateSlug,
      { ...noticeBoard.currentTemplate, cta_url: event.target.value },
    );
  }, [noticeBoard]);

  return (
    noticeBoard.currentTemplate ? (
      <>
        <input
          type="text"
          className="m-notice-board-form-templates__custom-url"
          value={noticeBoard.currentTemplate.cta_url || ''}
          onChange={handleUpdateCtaUrl}
          placeholder={noticeBoard.currentTemplate.cta_url || 'Enter URL'}
        />
        <input
          type="text"
          className="m-notice-board-form-templates__custom-text"
          value={noticeBoard.currentTemplate.cta_text || ''}
          onChange={handleUpdateCtaText}
          placeholder={
            noticeBoard.currentTemplate.cta_text || 'Enter button text'
          }
        />
      </>
    ) : null
  );
}

export default mobxify('meetingStore')(BannerListTemplateInput);
