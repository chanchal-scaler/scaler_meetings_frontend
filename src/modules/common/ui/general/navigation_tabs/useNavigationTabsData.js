import { createContext, useContext } from 'react';

export const NavigationTabsContext = createContext();

function useNavigationTabsData() {
  return useContext(NavigationTabsContext);
}

export default useNavigationTabsData;
