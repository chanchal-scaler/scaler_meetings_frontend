import { useState } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import Socket from '@common/lib/socket';

function useSocket(channel, data = {}) {
  const [socket, setSocket] = useState(null);

  // `data` can be an object which is created during render. To make sure that
  // the effect runs only when the data object as actually changed we are using
  // deep compare effect. `useDeepCompareEffect` is a costly hook and make
  // sure to use it only when you know what you are trying to do.
  useDeepCompareEffect(() => {
    const _socket = new Socket(channel, data);
    setSocket(_socket);

    return () => {
      _socket.destroy();
      setSocket(null);
    };
  }, [channel, data]);

  return socket;
}

export default useSocket;
