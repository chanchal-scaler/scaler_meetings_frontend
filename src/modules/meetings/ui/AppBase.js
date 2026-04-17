import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { PermissionRequestModal } from '~meetings/ui/media';
import { SettingsModal } from '~meetings/ui/settings';
import CAppBase from '@common/ui/AppBase';
import Provider from './Provider';

function AppBase({
  basename,
  children,
  stores,
}) {
  function ui() {
    if (basename) {
      return (
        <Router basename={basename}>
          <div className="layout m-layout">
            <div
              className="
                layout__content
                layout__content--transparent m-layout__content
              "
            >
              {children}
            </div>
          </div>
          <SettingsModal />
          <PermissionRequestModal />
        </Router>
      );
    } else {
      return children;
    }
  }

  return (
    <Provider stores={stores}>
      <CAppBase
        className="meeting-app"
        renderSingletons={Boolean(basename)}
      >
        {ui()}
      </CAppBase>
    </Provider>
  );
}

export default AppBase;
