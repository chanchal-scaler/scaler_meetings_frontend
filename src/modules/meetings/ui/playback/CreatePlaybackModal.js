import React, { useCallback, useEffect, useState } from 'react';

import { Field } from '@common/ui/form';
import { mobxify } from '~meetings/ui/hoc';
import { Modal, Tappable } from '@common/ui/general';
import { toast } from '@common/ui/general/Toast';

function CreatePlaybackModal({ meetingStore: store }) {
  const [url, setUrl] = useState('');
  const { meeting } = store;
  const { playback } = meeting;

  // Close modal on unmount
  useEffect(() => () => playback.setCreateModalOpen(false), [playback]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    try {
      await playback.add(url);
      playback.setCreateModalOpen(false);
      setUrl('');
      toast.show({ message: 'Video has been added' });
    } catch (error) {
      toast.show({
        message: 'Failed to add video',
        type: 'error',
      });
    }
  }, [playback, url]);


  return (
    <Modal
      isOpen={playback.isCreateModalOpen}
      onClose={() => playback.setCreateModalOpen(false)}
      title="Share a Video"
    >
      {playback.isCreateModalOpen && (
        <form
          className="form"
          onSubmit={handleSubmit}
        >
          <Field
            label="Video URL"
            hint="
              Will be shared with others in call and you would be
              controlling it
            "
            required
          >
            <input
              autoFocus
              onChange={(event) => setUrl(event.target.value)}
              required
              type="text"
              value={url}
            />
          </Field>
          <Tappable
            className="btn btn-primary full-width"
            component="button"
            disabled={playback.isLoading}
            type="submit"
          >
            Share Video
          </Tappable>
        </form>
      )}
    </Modal>
  );
}

export default mobxify('meetingStore')(CreatePlaybackModal);
