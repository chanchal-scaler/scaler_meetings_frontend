import React, { useState } from 'react';

import { HintLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import ErrorImg from '~meetings/images/circle-wavy-error.svg';
import ProxyMessageAccordian from './ProxyMessageAccordian';

function GenericChatContent({
  meetingStore: store,
}) {
  const [openTemplateId, setOpenTemplateId] = useState(null);

  const { proxyChatMessage } = store.meeting;
  const {
    cueCardTemplates,
    isCueCardBasedChatEnabled,
  } = proxyChatMessage;

  if (!isCueCardBasedChatEnabled) {
    return (
      <HintLayout
        imgComponent={(
          <img src={ErrorImg} alt="error" />
        )}
        isFit
        className="m-v-20 p-v-20"
        heading="No chats available at the moment !"
        message="These will be available once you trigger a Cue Card."
      />
    );
  } else if (!cueCardTemplates?.length) {
    return (
      <HintLayout
        imgComponent={(
          <img src={ErrorImg} alt="error" />
        )}
        isFit
        className="m-v-20 p-v-20"
        heading="No chats available at the moment !"
        message="No Templates are present currently, Check back later"
      />
    );
  } else {
    return (
      <div>
        {cueCardTemplates.map((content, id) => (
          <ProxyMessageAccordian
            key={id}
            content={content}
            isOpen={openTemplateId === id}
            templateId={id}
            handleUpdateTemplate={setOpenTemplateId}
            templateType="cueCard"
          />
        ))}
      </div>
    );
  }
}

export default mobxify('meetingStore')(GenericChatContent);
