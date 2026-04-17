import React from 'react';
import { Helmet } from 'react-helmet';

function HideZendeskSupportChat() {
  return (
    <Helmet>
      <html lang="en" data-hide-zendesk-support-chat="true" />
    </Helmet>
  );
}

export default HideZendeskSupportChat;
