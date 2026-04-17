import React from 'react';
import { Helmet } from 'react-helmet';

function HideAcademyChatMainWindow() {
  return (
    <Helmet>
      <html lang="en" data-hide-academy-chat-main-window="true" />
    </Helmet>
  );
}

export default HideAcademyChatMainWindow;
