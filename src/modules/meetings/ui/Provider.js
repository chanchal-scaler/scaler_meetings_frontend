import React, { createContext } from 'react';

export const MobxContext = createContext();

function Provider({ stores, ...remainingProps }) {
  return <MobxContext.Provider value={stores} {...remainingProps} />;
}

export default Provider;
