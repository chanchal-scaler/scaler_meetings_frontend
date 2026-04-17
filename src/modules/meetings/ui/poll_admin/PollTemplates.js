import React from 'react';

import { HintLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import TemplateTrailer from './TemplateTrailer';

function PollList({ pollStore: store }) {
  function itemUi(poll, index) {
    return (
      <TemplateTrailer
        key={poll.name}
        className="m-v-10"
        index={index}
        poll={poll}
      />
    );
  }

  if (store.templateCount > 0) {
    return (
      <div className="mcq-hq-list">
        {store.templates.map(itemUi)}
      </div>
    );
  } else {
    return (
      <HintLayout
        message="There are no templates available"
      />
    );
  }
}

export default mobxify('pollStore')(PollList);
