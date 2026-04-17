import { useEffect } from 'react';

function usePlaylistPreload(preloader) {
  const shouldPreload = preloader?.shouldPreload;

  useEffect(() => {
    if (!preloader) return;

    preloader.fetchInfo();
  }, [preloader]);

  useEffect(() => {
    if (!preloader) return;

    if (shouldPreload) {
      preloader.cacheNext();
    } else {
      preloader.stopCaching();
    }
  }, [preloader, shouldPreload]);
}

export default usePlaylistPreload;
