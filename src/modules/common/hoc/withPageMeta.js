import React from 'react';

import { PageMeta } from '@common/ui/general';

function withPageMeta(BaseComponent, metaData) {
  function WithPageMeta(props) {
    return (
      <>
        <PageMeta {...metaData} />
        <BaseComponent {...props} />
      </>
    );
  }

  return WithPageMeta;
}

export default withPageMeta;
