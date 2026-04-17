import React from 'react';
import { Helmet } from 'react-helmet';

function HideAcademyChat() {
  return (
    <Helmet>
      <html lang="en" data-hide-academy-chat="true" />
    </Helmet>
  );
}

export default HideAcademyChat;
