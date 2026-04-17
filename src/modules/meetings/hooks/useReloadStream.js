import { useEffect } from 'react';

import { logEvent } from '@common/utils/logger';
import { toast } from '@common/ui/general/Toast';

const MAX_ATTEMPTS = 3;

const WAIT_FACTOR = 1500; // In ms

const MAX_WAIT = 4000; // In ms

const HOPELESS_CASE_MESSAGE = 'Unable to load some streams. '
  + 'Try switching to a better network and rejoining the session';

function useReloadStream(stream) {
  const canAutoReload = stream.numLoadAttempts < MAX_ATTEMPTS;
  useEffect(() => {
    /**
     * In recording mode, if stream has error,
     * then auto reload stream to mitigate the error
     */
    if (
      stream.loadError
      && !stream.isLoading
    ) {
      // If num attempts is less than max attempts then retry automatically
      if (canAutoReload) {
        // Wait time in ms
        const timeout = Math.min(
          WAIT_FACTOR * stream.numLoadAttempts,
          MAX_WAIT,
        );

        const requestTimeout = setTimeout(() => {
          stream.load();
        }, timeout);

        return () => clearTimeout(requestTimeout);
      } else {
        toast.show({
          message: HOPELESS_CASE_MESSAGE,
          type: 'error',
          duration: 5000,
        });
        logEvent(
          'error',
          'StreamError: Failed after multiple attempts',
        );
      }
    }

    return undefined;
  }, [
    canAutoReload, stream.isLoading, stream.loadError,
    stream.numLoadAttempts, stream,
  ]);

  return canAutoReload;
}

export default useReloadStream;
