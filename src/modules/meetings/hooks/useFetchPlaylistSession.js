import { useEffect } from 'react';

function useFetchPlaylistSession(meeting) {
  useEffect(() => {
    meeting.manager.fetchPlaylistSessionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default useFetchPlaylistSession;
