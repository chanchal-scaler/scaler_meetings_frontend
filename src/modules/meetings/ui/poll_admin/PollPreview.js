import React from 'react';

import { Icon, Tappable } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import ChoicesPreview from './ChoicesPreview';

function PollPreview({ pollStore: store }) {
  function headerUi() {
    return (
      <div className="mcq-preview__header">
        <h3 className="bold dark m-b-10">Audience View</h3>
        <div className="hint bold">
          Audience will see the poll in the following manner.
        </div>
      </div>
    );
  }

  function bodyUi() {
    if (store.activeTab === 'create' || store.editingPoll) {
      return (
        <ChoicesPreview
          choices={store.choices}
          className="mcq-preview__problem"
          description={store.description}
        />
      );
    } else if (store.activeTab === 'templates' && store.previewTemplate) {
      const { description, choices } = store.previewTemplate;
      return (
        <ChoicesPreview
          choices={choices}
          className="mcq-preview__problem"
          description={description}
        />
      );
    } else if (store.previewPoll) {
      const { description, choices } = store.previewPoll;
      return (
        <ChoicesPreview
          choices={choices}
          className="mcq-preview__problem"
          description={description}
        />
      );
    } else {
      return (
        <div className="mcq-preview__hint hint">
          Poll you select for preview on the left will be previewed here
        </div>
      );
    }
  }

  function footerUi() {
    return (
      <div className="mcq-preview__footer layout__footer">
        <Tappable
          className="mcq-preview__toggle flex-row hint"
          onClick={() => store.setPreviewOpen(false)}
        >
          <span className="flex-fill m-r-10">
            Minimize
          </span>
          <Icon name="chevron-right" />
        </Tappable>
      </div>
    );
  }

  return (
    <div className="mcq-preview layout">
      <div className="layout__content mcq-preview__content">
        {headerUi()}
        {bodyUi()}
      </div>
      {footerUi()}
    </div>
  );
}

export default mobxify('pollStore')(PollPreview);
