import React from 'react';

import { isMobile } from '@common/utils/platform';
import MobileSteps from './MobileSteps';
import DesktopSteps from './DesktopSteps';

export default function StepsToAllowMedia() {
  if (isMobile()) {
    return <MobileSteps />;
  } else {
    return <DesktopSteps />;
  }
}
