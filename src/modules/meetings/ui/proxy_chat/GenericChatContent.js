import React, { useState } from 'react';

import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import ErrorImg from '~meetings/images/circle-wavy-error.svg';
import ProxyMessageAccordian from './ProxyMessageAccordian';

function GenericChatContent({
  meetingStore: store,
}) {
  const [openTemplateId, setOpenTemplateId] = useState(null);
  const { proxyChatMessage } = store.meeting;
  const { genericChatTemplates, isFetchingTemplates } = proxyChatMessage;

  if (isFetchingTemplates) {
    return (
      <LoadingLayout
        className="m-v-20 p-v-20"
        isFit
      />
    );
  } else if (!genericChatTemplates.length) {
    return (
      <HintLayout
        imgComponent={(
          <img src={ErrorImg} alt="error" />
        )}
        isFit
        className="m-v-20 p-v-20"
        message="No chats available at the moment !"
      />
    );
  } else {
    return (
      <div>
        {genericChatTemplates.map((template, id) => (
          <ProxyMessageAccordian
            key={id}
            content={template}
            templateId={id}
            isOpen={openTemplateId === id}
            handleUpdateTemplate={setOpenTemplateId}
            templateType="generic"
          />
        ))}
      </div>
    );
  }
}

export default mobxify('meetingStore')(GenericChatContent);
