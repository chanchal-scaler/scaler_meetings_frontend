import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import {
  Browser, Connection, Device, Proxy,
} from './checklist_items';
import { HorizontalScrollView } from '@common/ui/general';
import { isScalerMobileApp } from '@common/utils/platform';
import { mobxify } from '~meetings/ui/hoc';

function Checklist({ variant }) {
  return (
    <div
      className={classNames(
        'm-checklist',
        { 'm-checklist--light': variant === 'light' },
        { 'm-checklist--dark': variant === 'dark' },
      )}
    >
      <div className="m-checklist__start">
        Ensure following for a smoother experience during the session
      </div>
      <HorizontalScrollView
        className={classNames(
          'm-checklist__items',
          { 'm-checklist__items--mobile': isScalerMobileApp() },
        )}
        arrowClassName="m-checklist__arrow"
      >
        <Device shouldRender={!isScalerMobileApp()} />
        <Browser shouldRender={!isScalerMobileApp()} />
        <Proxy />
        <Connection />
      </HorizontalScrollView>
    </div>
  );
}

Checklist.propTypes = {
  variant: PropTypes.string.isRequired,
};

export default mobxify('meetingStore')(Checklist);
