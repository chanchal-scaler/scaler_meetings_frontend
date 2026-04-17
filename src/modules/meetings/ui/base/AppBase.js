import React from 'react';

import { PermissionRequestModal } from '~meetings/ui/media';
import { SettingsModal } from '~meetings/ui/settings';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import CAppBase from '@common/ui/AppBase';

function AppBase({
  children,
  ...remainingProps
}) {
  return (
    <CAppBase
      className="meeting-app"
      namespace={SINGLETONS_NAME}
      renderSingletons
      {...remainingProps}
    >
      {children}
      <SettingsModal />
      <PermissionRequestModal />
    </CAppBase>
  );
}

export default AppBase;
