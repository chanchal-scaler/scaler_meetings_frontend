import { useCallback, useState } from 'react';

import useUnmountedRef from './useUnmountedRef';

export default function useLoaderState() {
  const isUnmoutedRef = useUnmountedRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onClick = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const onHandleFailure = useCallback((err) => {
    if (isUnmoutedRef.current) return;

    setLoading(false);
    setError(err);
  }, [isUnmoutedRef]);

  const onHandleSuccess = useCallback(() => {
    if (isUnmoutedRef.current) return;

    setLoading(false);
    setError(null);
  }, [isUnmoutedRef]);

  return {
    loading, error, onClick, onHandleSuccess, onHandleFailure,
  };
}
