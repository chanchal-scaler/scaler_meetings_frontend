import { useContext } from 'react';

import { GlobalStateContext } from '~video_player/ui/context';

function useGlobalState() {
  return useContext(GlobalStateContext);
}

export default useGlobalState;
