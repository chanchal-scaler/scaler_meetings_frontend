import React from 'react';
import { Helmet } from 'react-helmet';

function HideNotebook() {
  return (
    <Helmet>
      <html lang="en" data-hide-notebook="true" />
    </Helmet>
  );
}

export default HideNotebook;
