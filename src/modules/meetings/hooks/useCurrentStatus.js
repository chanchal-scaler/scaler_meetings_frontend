import { createContext, useContext } from 'react';

export const CurrentStatusContext = createContext();

function useCurrentStatus() {
  const status = useContext(CurrentStatusContext);
  return status;
}

export default useCurrentStatus;
