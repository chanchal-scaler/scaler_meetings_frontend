import React, { useMemo } from 'react';

import { evaluateInWebview, notifyWebview } from '@common/utils/webview';
import { Icon, Tappable } from '@common/ui/general';

function useHeaderLeftActions() {
  const headerLeftActions = useMemo(() => [
    evaluateInWebview('canAddBackButton') && (
      <Tappable
        key="meeting-back-button"
        className="btn btn-icon btn-light"
        onClick={() => notifyWebview('closeWebview')}
      >
        <Icon name="arrow-left" />
      </Tappable>
    ),
  ].filter(Boolean), []);

  return headerLeftActions;
}

export default useHeaderLeftActions;
