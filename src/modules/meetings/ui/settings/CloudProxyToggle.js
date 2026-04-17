import React, { useCallback } from 'react';

import { dialog } from '@common/ui/general/Dialog';
import { mobxify } from '~meetings/ui/hoc';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import { SwitchRow } from '@common/ui/general';

const dialogTitlesMap = {
  enabled: 'Enable proxy connection?',
  disabled: 'Disable proxy connection?',
};

const dialogOkLabelsMap = {
  enabled: 'Yes, Enable Proxy',
  disabled: 'Yes, Disable Proxy',
};

function ProxyConfirmationDialogMessage({ isEnabled }) {
  if (isEnabled) {
    return (
      <>
        <div>
          We do not recommend enabling proxy unless:
        </div>
        <ul className="compact-list m-t-10">
          <li>
            You are having
            {' '}
            <span className="dark bold">trouble connecting</span>
            {' '}
            to the session.
          </li>
          <li>
            You are in a restricted network like
            {' '}
            <span className="dark bold">VPN or a firewall</span>
            {' '}
            which
            cannot be disabled or changed from your end.
          </li>
        </ul>
        <div className="m-t-20">
          Please note that proceeding will:
        </div>
        <ul className="compact-list m-t-10">
          <li>
            Use the proxy connection when connecting to the session.
          </li>
          <li>
            Will
            {' '}
            <span className="bold dark">reload the page</span>
            {' '}
            to re join the session.
          </li>
        </ul>
      </>
    );
  } else {
    return (
      <>
        <div>
          Please note that proceeding will have the following effects:
        </div>
        <ul className="compact-list m-t-10">
          <li>
            Disable the proxy connection when connecting to the session.
          </li>
          <li>
            <span className="bold dark">Reload the page</span>
            {' '}
            to rejoin the session.
          </li>
        </ul>
      </>
    );
  }
}

function CloudProxyToggle({ meetingStore, settingsStore: store }) {
  const { meeting } = meetingStore;

  const handleToggle = useCallback((event) => {
    const isEnabled = event.target.checked;
    const action = isEnabled ? 'enabled' : 'disabled';
    store.setSettingsModalOpen(false);
    dialog.show({
      name: SINGLETONS_NAME,
      title: dialogTitlesMap[action],
      content: <ProxyConfirmationDialogMessage isEnabled={isEnabled} />,
      onOk: () => {
        store.setCloudProxyEnabled(isEnabled);
        if (isEnabled) {
          meeting.track('drona-proxy-enabled');
        } else {
          meeting.track('drona-proxy-disabled');
        }
        window.location.reload();
      },
      onCancel: () => store.setSettingsModalOpen(true),
      onClose: () => store.setSettingsModalOpen(true),
      okClass: 'btn-danger',
      okLabel: dialogOkLabelsMap[action],
      cancelLabel: 'No, Go Back',
    });
  }, [meeting, store]);

  if (meeting && meeting.canSetProxy) {
    return (
      <SwitchRow
        activeColor="#0041ca"
        checked={store.cloudProxyEnabled}
        hint="
          Enable if you are using VPN or are under a firewall and are unable to
          connect to the session. Please note that the experience when this is
          enabled may not be ideal.
        "
        label="Use Proxy"
        onChange={handleToggle}
      />
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore', 'settingsStore')(CloudProxyToggle);
