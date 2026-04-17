import { useContext } from 'react';

import { ActionsContext } from '~video_player/ui/context';

function useActions() {
  return useContext(ActionsContext);
}

export default useActions;
