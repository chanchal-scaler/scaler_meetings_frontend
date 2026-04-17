import { createContext, useContext } from 'react';

export const SeekbarContext = createContext();

function useSeekbarContext() {
  return useContext(SeekbarContext);
}

export default useSeekbarContext;
