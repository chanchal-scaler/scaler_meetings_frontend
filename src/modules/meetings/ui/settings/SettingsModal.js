import React, { useEffect } from 'react';
import classNames from 'classnames';

import { mobxify } from '~meetings/ui/hoc';
import {
  Icon,
  Modal,
  Tappable,
} from '@common/ui/general';
import { useMediaQuery } from '@common/hooks';
import AdminSettings from './AdminSettings';
import ChatSettings from './ChatSettings';
import ConnectionSettings from './ConnectionSettings';
import MediaSettings from './MediaSettings';
import Panels from './Panels';
import ScreenShareSettings from './ScreenShareSettings';

const defaultTab = 'video';

// todo: verify trackings
function SettingsModal({ settingsStore: store }) {
  const { mobile } = useMediaQuery();
  let { activeTab } = store;
  // Desktop layout has a default tab that is shown
  if (!mobile && !activeTab) {
    activeTab = defaultTab;
  }

  useEffect(() => () => {
    // Close modal when component is unmounted
    store.setSettingsModalOpen(false);
    store.setActiveTab('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function closeUi() {
    return (
      <div className="m-settings__close">
        <Tappable
          className="btn btn-icon btn-dark"
          onClick={() => store.setSettingsModalOpen(false)}
        >
          <Icon name="close" />
        </Tappable>
      </div>
    );
  }

  function backUi() {
    return (
      <div className="m-settings__back">
        <Tappable
          className="btn btn-icon btn-dark"
          onClick={() => store.setActiveTab('')}
        >
          <Icon name="chevron-left" />
        </Tappable>
      </div>
    );
  }

  function sectionUi() {
    switch (activeTab) {
      case 'chat':
        return <ChatSettings />;
      case 'audio':
      case 'video':
        return (
          <MediaSettings
            key={activeTab}
            mode={activeTab}
          />
        );
      case 'screen':
        return <ScreenShareSettings />;
      case 'connection':
        return <ConnectionSettings />;
      case 'admin':
        return <AdminSettings />;
      default:
        return null;
    }
  }

  function sectionTitleUi() {
    switch (activeTab) {
      case 'chat':
        return 'Chat Settings';
      case 'audio':
        return 'Audio Settings';
      case 'video':
        return 'Video Settings';
      default:
        return null;
    }
  }

  function headerUi() {
    return (
      <div className="m-settings__header">
        <div className="m-settings__title show-in-mobile">
          {sectionTitleUi()}
        </div>
        <span className="hide-in-mobile">
          {closeUi()}
        </span>
        <span className="show-in-mobile">
          {backUi()}
        </span>
      </div>
    );
  }

  function mainUi() {
    return (
      <div
        className={classNames(
          'm-settings__main',
          { 'm-settings__main--active': Boolean(activeTab) },
        )}
      >
        {headerUi()}
        <div className="m-settings__sections">
          {sectionUi()}
        </div>
      </div>
    );
  }

  function sidebarUi() {
    return (
      <div
        className={classNames(
          'm-settings__sidebar',
          { 'm-settings__sidebar--active': !activeTab },
        )}
      >
        <div className="m-settings__title">
          Settings
          <span className="show-in-mobile">
            {closeUi()}
          </span>
        </div>
        <div className="m-settings__panels">
          <Panels activeTab={activeTab} />
        </div>
      </div>
    );
  }

  function ui() {
    if (store.isSettingsModalOpen) {
      return (
        <div className="m-settings__body">
          {sidebarUi()}
          {mainUi()}
        </div>
      );
    } else {
      return null;
    }
  }

  return (
    <Modal
      className="m-modal m-settings"
      isOpen={store.isSettingsModalOpen}
      onClose={() => store.setSettingsModalOpen(false)}
      withoutHeader
      hasCloseButton={false}
    >
      {ui()}
    </Modal>
  );
}

export default mobxify('settingsStore')(SettingsModal);
