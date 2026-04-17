import React from 'react';
import { Helmet } from 'react-helmet';

function HideBodyScroll() {
  return (
    <Helmet>
      <html lang="en" data-hide-scroll="true" />
    </Helmet>
  );
}

export default HideBodyScroll;
