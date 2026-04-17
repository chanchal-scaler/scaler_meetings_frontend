import React from 'react';
import { Route, Routes } from 'react-router-dom';

const RoutesItemGenerator = ({ routes }) => (
  <Routes>
    {Object.entries(routes).map(
      ([path, { component: Component, ...rest }]) => (
        <Route key={path} path={path} element={<Component {...rest} />} />
      ),
    )}
  </Routes>
);

export default RoutesItemGenerator;
