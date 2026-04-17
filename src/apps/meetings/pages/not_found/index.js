import React from 'react';

import { RedirectLayout } from '@common/ui/layouts';

function NotFoundPage() {
  return (
    <RedirectLayout
      isTransparent
      message="Page you are looking for does not exist"
    />
  );
}

export default NotFoundPage;
