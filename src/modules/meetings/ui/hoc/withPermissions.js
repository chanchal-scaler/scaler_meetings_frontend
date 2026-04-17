import React, { useEffect } from 'react';

import mobxify from './mobxify';

function withPermissions(BaseComponent) {
  function WithPermissions({ mediaStore: store, ...remainingProps }) {
    useEffect(() => {
      store.requestPermissions();
    }, [store]);

    return <BaseComponent {...remainingProps} />;
  }

  return mobxify('mediaStore')(WithPermissions);
}

export default withPermissions;
