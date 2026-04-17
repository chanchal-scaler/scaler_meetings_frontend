import React, { useCallback } from 'react';
import classNames from 'classnames';

import { mobxify } from '~meetings/ui/hoc';
import { Icon, Tappable } from '@common/ui/general';

function ReactionTooltip({ settingsStore: store }) {
  const openState = store.rTooltipEnabled
    || store.rTooltipOnInteraction;

  const handleClose = useCallback(() => {
    if (store.rTooltipEnabled) {
      return store.setRTooltipEnabled(false);
    }

    return store.setRTooltipOnInteraction(false);
  }, [store]);

  return (
    <div className={classNames(
      'reactions-tooltip',
      { 'reactions-tooltip--visible': openState },
    )}
    >
      <Tappable
        onClick={handleClose}
      >
        <Icon
          name="close"
          className="reactions-tooltip__close-btn"
        />
      </Tappable>
      React with your host here for easy communication.
    </div>
  );
}

export default mobxify('settingsStore')(ReactionTooltip);
