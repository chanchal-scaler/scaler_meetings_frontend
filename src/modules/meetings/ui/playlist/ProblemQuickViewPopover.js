import React from 'react';

import QuickViewPopoverWrapper from './QuickViewPopoverWrapper';
import LoadPlaylistContent from './LoadPlaylistContent';
import ProblemQuickViewContent from './ProblemQuickViewContent';

export default function ProblemQuickViewPopover({
  content,
  parentRef,
}) {
  return (
    <QuickViewPopoverWrapper
      content={content}
      parentRef={parentRef}
      closeOnOutsideClick
    >
      <LoadPlaylistContent content={content} className="m-quick-view__content">
        {() => (
          <ProblemQuickViewContent
            content={content}
          />
        )}
      </LoadPlaylistContent>
    </QuickViewPopoverWrapper>
  );
}
