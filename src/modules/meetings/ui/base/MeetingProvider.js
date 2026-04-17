import React, { useEffect, useMemo } from 'react';

import Provider from '~meetings/ui/Provider';
import stores from '~meetings/stores';

function MeetingProvider({ children, extraStores = {} }) {
  const finalStores = useMemo(() => ({
    ...stores,
    ...extraStores,
  }), [extraStores]);

  useEffect(() => {
    // Adding this temporarily until assisted live bugs are confirmed to
    // be fixed
    window.__MOBX_STORES__ = finalStores;
  }, [finalStores]);

  return (
    <Provider stores={finalStores}>
      {children}
    </Provider>
  );
}

export default MeetingProvider;
