import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import RoutesItemGenerator from './RoutesItemGenerator';

const RoutesGenerator = ({
  basename, routes, children, wrapper,
}) => {
  const Wrapper = wrapper || React.Fragment;

  return (
    <BrowserRouter basename={basename}>
      <Wrapper>
        <RoutesItemGenerator routes={routes} />
        {children}
      </Wrapper>
    </BrowserRouter>
  );
};

export default RoutesGenerator;
