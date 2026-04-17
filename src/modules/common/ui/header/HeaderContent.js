import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import HeaderHamburger from './HeaderHamburger';
import { Icon } from '@common/ui/general';
import WhatsappImageIcon from '@common/images/png/whatsapp2.png';
import IvrImageIcon from '@common/images/png/ivr-logo.svg';

const TOOL_TIP_LOCAL_STORAGE_KEY = 'NotificationsTooltipClosed';

function HeaderContent({
  items,
  className,
  brandLogo,
  dropDown,
  showWhatsappTooltip,
  showIvrTooltip,
  showHamburger,
  sidebarOpen,
  hamburgerClick,
}) {
  const [toolTipState, setToolTipState] = useState(false);

  function closeTooltip() {
    window.storeEsEvent(
      'nc-tooltip-closed',
    );
    setToolTipState(false);
    localStorage.setItem(TOOL_TIP_LOCAL_STORAGE_KEY, true);
  }

  useEffect(() => {
    const currentState = localStorage.getItem(TOOL_TIP_LOCAL_STORAGE_KEY);
    setToolTipState((showWhatsappTooltip || showIvrTooltip) && !currentState);
  }, [showWhatsappTooltip, showIvrTooltip]);

  return (
    <div
      data-testid="header"
      className={classNames(
        'sr-header',
        'p-v-20',
        { [className]: className },
      )}
    >
      <div className="sr-header__brand">
        {(showHamburger) ? (
          <HeaderHamburger
            onClick={hamburgerClick}
            sidebarOpen={sidebarOpen}
          />
        ) : brandLogo}
      </div>
      <div className="sr-header__content">
        {items}
      </div>
      {dropDown && (
        <div className="sr-header__dropdown">
          {dropDown}
        </div>
      )}
      {toolTipState && (
        <div className="notifications-consent-tooltip">
          <button
            data-cy="nc-tooltip-close-trigger"
            data-testid="nc-tooltip-close"
            type="button"
            className="notifications-consent-tooltip__close"
            onClick={closeTooltip}
          >
            <Icon name="clear" />
          </button>

          <div className="notifications-consent-tooltip__container">
            <div className="notifications-consent-tooltip__content">
              <div className="notifications-consent-tooltip__heading">
                <img
                  alt="wa icon"
                  src={WhatsappImageIcon}
                  className="notifications-consent-tooltip__wa-icon"
                />
                <h5>Enable Whatsapp Notification</h5>
              </div>
              <p
                className="notifications-consent-tooltip__desc"
              >
                Never miss out on important updates about
                the classes & events from us&nbsp;
                <span role="img" aria-label="bell">🔔</span>
              </p>
            </div>

            <hr />

            <div className="notifications-consent-tooltip__content">
              <div className="notifications-consent-tooltip__heading">
                <img
                  alt="ivr icon"
                  src={IvrImageIcon}
                  className="notifications-consent-tooltip__icon"
                />
                <h5>Change IVR Calls Settings</h5>
              </div>
              <p
                className="notifications-consent-tooltip__desc"
              >
                You get an IVR call 3 hours before a mentor session
                (Only between 6:00 AM to 10:00 PM).
                You can disable this feature if not needed
              </p>
            </div>

            <a
              className="nav-link notifications-consent-tooltip__link"
              href="/settings/scaler/#/notifications"
              onClick={
                () => {
                  window.storeEsEvent(
                    'nc-tooltip-click-change-notification-settings',
                  );
                }
              }
            >
              Change notification settings
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

HeaderContent.propTypes = {
  className: PropTypes.string,
  items: PropTypes.object.isRequired,
};

export default HeaderContent;
