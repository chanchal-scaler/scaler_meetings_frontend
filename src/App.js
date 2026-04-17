import React, { useEffect } from 'react';
import {
  BrowserRouter as Router, Navigate, Route, Routes,
} from 'react-router-dom';

import { setSocketTokenResolver } from '@common/lib/socket';
import { AppContainer } from '~meetings/components/containers';
import { BASENAME } from '~meetings/utils/constants';
import appStores from '@meetings/stores';
import HistoryListener from '@common/ui/HistoryListener';
import HomePage from '@meetings/pages/home';
import MeetingPage from '@meetings/pages/meeting';
import NotFoundPage from '@meetings/pages/not_found';
import RecordingPage from '@meetings/pages/recording';
import UploadPage from '@meetings/pages/upload';

function App() {
  const routerBaseName = window.location.pathname.startsWith(BASENAME)
    ? BASENAME
    : '/';

  useEffect(() => {
    setSocketTokenResolver(() => appStores.userContextStore.currentUserSlug);
    appStores.userContextStore.load();

    return () => setSocketTokenResolver(null);
  }, []);

  return (
    <AppContainer extraStores={appStores}>
      <Router basename={routerBaseName}>
        <div className="layout m-layout">
          <div
            className="
                layout__content
                layout__content--transparent m-layout__content
              "
          >
            <HistoryListener>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/i/:slug/recording" element={<RecordingPage />} />
                <Route path="/i/:slug/*" element={<MeetingPage />} />
                <Route path="/:slug/attachments/upload" element={<UploadPage />} />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </HistoryListener>
          </div>
        </div>
      </Router>
    </AppContainer>
  );
}

export default App;
