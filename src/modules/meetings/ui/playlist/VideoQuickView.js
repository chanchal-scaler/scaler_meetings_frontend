import React, { useCallback } from 'react';

import { AspectRatio, Modal } from '@common/ui/general';
import { ComposedVideo } from '~video_player/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { PLAYLIST_CONTENT_PLAYBACK_RATES } from '~meetings/utils/playlist';
import LoadPlaylistContent from './LoadPlaylistContent';

// Gracefully handles max 2 videos currently on UI
function VideoQuickView({ content }) {
  const videoSources = content.videos.map(video => video.url);

  const handleModalClose = useCallback(() => {
    content.setQuickViewOpen(false);
  }, [content]);

  return (
    <Modal
      canClose
      closeOnBackdropClick
      hasBackdrop
      isOpen={content.isQuickViewOpen}
      onClose={handleModalClose}
      size="extra-large"
      unMountOnClose
      title="PRIVATE MODE: Video only visible to you"
    >
      <LoadPlaylistContent
        className="m-quick-view__content"
        content={content}
      >
        {() => (
          <AspectRatio
            className="m-asl-preview"
            ratio={16 / 9}
          >
            <div className="m-asl-preview__videos">
              <ComposedVideo
                masterClassName="m-asl-preview__master"
                playbackRates={PLAYLIST_CONTENT_PLAYBACK_RATES}
                slaveClassName="m-asl-preview__slave"
                videoSources={videoSources}
              />
            </div>
          </AspectRatio>
        )}
      </LoadPlaylistContent>
    </Modal>
  );
}

export default mobxify('meetingStore')(VideoQuickView);
