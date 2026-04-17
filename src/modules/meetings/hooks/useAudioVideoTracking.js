import { useEffect } from 'react';

function useAudioVideoTracking({
  meeting,
  type,
  isMuted,
}) {
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    function handleUnload() {
      meeting.track(type, 'click', 0);
    }
    // isMuted is undefined initially hence the
    // if condition below is written as such
    if (isMuted === false) {
      meeting.track(type, 'click', 1);
      window.addEventListener('unload', handleUnload);
      return () => {
        meeting.track(type, 'click', 0);
        window.removeEventListener('unload', handleUnload);
      };
    }
  }, [isMuted, meeting, type]);
}

export default useAudioVideoTracking;
