import React from 'react';
import { createRoot } from 'react-dom/client';
import { detectIfTouchDevice } from '@common/utils/touch';
import { ensureMeetingConfig } from '@common/lib/meetingConfig';
import App from './App';

import '@common/styles/index.scss';
import '~meetings/index.scss';

detectIfTouchDevice();
ensureMeetingConfig();

createRoot(document.getElementById('root')).render(
  <App />,
);
