import React from 'react';

import QuickViewPopoverWrapper from './QuickViewPopoverWrapper';
import LoadPlaylistContent from './LoadPlaylistContent';
import CueCardQuickViewContent from './CueCardQuickViewContent';

export default function CueCardQuickViewPopover({ content, parentRef }) {
  return (
    <QuickViewPopoverWrapper content={content} parentRef={parentRef}>
      <LoadPlaylistContent content={content} className="m-quick-view__content">
        {() => <CueCardQuickViewContent content={content} />}
      </LoadPlaylistContent>
    </QuickViewPopoverWrapper>
  );
}
