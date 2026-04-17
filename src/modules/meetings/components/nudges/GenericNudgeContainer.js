import React from 'react';

import { mobxify } from '~meetings/ui/hoc';
import { useAddNudgeHandler } from '~meetings/hooks';
import GenericNudge from '~meetings/components/nudges/GenericNudge';

function GenericNudgeContainer({
  genericNudgeStore: store, popoverRef,
}) {
  const { currentNudge } = store;
  const {
    nudgeType, nudgeComponent, nudgeProps,
  } = currentNudge || {};
  useAddNudgeHandler(store);

  if (!currentNudge) return null;

  if (nudgeComponent) {
    return (
      React.createElement(
        nudgeComponent,
        {
          nudgeType,
          ...nudgeProps,
        },
      )
    );
  } else {
    return (
      <GenericNudge
        popoverRef={popoverRef}
        nudgeType={nudgeType}
        {...nudgeProps}
      />
    );
  }
}

export default mobxify('genericNudgeStore')(GenericNudgeContainer);
