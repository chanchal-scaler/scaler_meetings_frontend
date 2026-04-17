import React from 'react';
import { Helmet } from 'react-helmet';

function HideBodyZoom() {
  return (
    <Helmet>
      <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0" />
    </Helmet>
  );
}

export default HideBodyZoom;
