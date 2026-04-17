import { createContext, useContext } from 'react';

export const WidgetDataContext = createContext();

function useWidgetData() {
  return useContext(WidgetDataContext);
}

export default useWidgetData;
