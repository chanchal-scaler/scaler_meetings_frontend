import React from 'react';

import { AdvancedMdRenderer } from '@common/ui/markdown';
import { attachDronaEventListeners } from '~meetings/utils/gtm';
import { getDeviceType } from '@common/utils/platform';
import ZoomInAndOut from '~meetings/ui/ZoomInAndOut';
import { useMediaQuery } from '@common/hooks';

function ZoomWrapper({
  children,
}) {
  const { mobile } = useMediaQuery();

  if (getDeviceType() === 'mobile' || mobile) {
    return (
      <ZoomInAndOut settings={{
        smooth: true,
        limitToBounds: false,
        disablePadding: true,
      }}
      >
        {children}
      </ZoomInAndOut>
    );
  } else {
    return children;
  }
}

function CueCardContent({
  content,
}) {
  return (
    <ZoomWrapper>
      <div className="m-cue-card-content">
        <AdvancedMdRenderer
          className="m-cue-card-content__markdown"
          mdString={content.mdString}
          parseMathExpressions
          onRenderComplete={attachDronaEventListeners}
        />
      </div>
    </ZoomWrapper>
  );
}

export default CueCardContent;
