import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { AspectRatio } from '@common/ui/general';
import {
  LayoutModes,
  WIDGET_LAYOUT_MODES,
} from '~meetings/utils/layout';
import { MeetingStatus } from '~meetings/utils/meeting';
import { WIDGET_ASPECT_RATIO } from '~meetings/utils/constants';
import layoutStore from '~meetings/stores/layoutStore';
import Upcoming from './Upcoming';
import Live from './Live';
import Archive from './Archive';
import Widget from '~meetings/widgets/Widget';

export const bodyClassMap = {
  [LayoutModes.portrait]: 'meeting-widget-portrait',
  [LayoutModes.standalone]: 'meeting-standalone',
  [LayoutModes.widgetSmall]: 'meeting-widget-small',
  [LayoutModes.widgetLarge]: 'meeting-widget-large',
};

function CallWidget({
  layoutMode = LayoutModes.widgetSmall,
  slug,
  status,
  aspectRatio = WIDGET_ASPECT_RATIO,
}) {
  // TODO Remove layoutStore and its dependencies
  useEffect(() => {
    layoutStore.setMode(layoutMode);
    const bodyClass = bodyClassMap[layoutMode];
    document.documentElement.classList.add(bodyClass);

    return () => document.documentElement.classList.remove(bodyClass);
  }, [layoutMode]);


  return (
    <AspectRatio ratio={aspectRatio}>
      <Widget
        slug={slug}
        status={status}
        upcomingComponent={Upcoming}
        liveComponent={Live}
        archiveComponent={Archive}
      />
    </AspectRatio>
  );
}

CallWidget.propTypes = {
  layoutMode: PropTypes.oneOf(WIDGET_LAYOUT_MODES),
  slug: PropTypes.string.isRequired,
  status: PropTypes.oneOf(Object.values(MeetingStatus)),
};

export default CallWidget;
