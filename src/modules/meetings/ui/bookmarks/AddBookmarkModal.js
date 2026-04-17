import React, { useCallback, useEffect } from 'react';

import { CUE_CARD_TRACKING } from '~meetings/utils/constants';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { Field } from '@common/ui/form';
import { mobxify } from '~meetings/ui/hoc';
import { Modal, Tappable } from '@common/ui/general';
import { toast } from '@common/ui/general/Toast';
import { UserAuthenticationError } from '~meetings/errors';
import analytics from '@common/utils/analytics';
import analyticsOld from '~meetings/analytics';

function AddBookmarkModal({ meetingStore: store }) {
  const { meeting } = store;

  // Close modal on unmount
  useEffect(() => () => meeting.setBookmarkModalOpen(false), [meeting]);


  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    try {
      await meeting.addBookmark();
      toast.show({
        message: 'Bookmark Added',
        type: 'success',
      });
      meeting.setBookmarkInput('');
      meeting.setBookmarkModalOpen(false);
    } catch (error) {
      if (!(error instanceof UserAuthenticationError)) {
        toast.show({
          message: 'Failed to add bookmark',
          type: 'error',
        });
      }
    }
  }, [meeting]);

  const handleAddBookamrk = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaAddBookmarkClick,
      click_source: DRONA_SOURCES.meetingBookmarkModal,
      click_feature: DRONA_FEATURES.bookmark,
    });
    analyticsOld.click(
      CUE_CARD_TRACKING.inClassBookmarking,
      'Paid Live Class Add Missing Bookmark', {
        bookmark_name: meeting.bookmarkInput,
      },
    );
  }, [meeting]);

  return (
    <Modal
      isOpen={meeting.isBookmarkModalOpen}
      onClose={() => meeting.setBookmarkModalOpen(false)}
      title="Bookmark this point"
      unMountOnClose
    >
      <form
        className="form"
        onSubmit={handleSubmit}
      >
        <Field
          label="Title"
          required
        >
          <input
            autoFocus
            onChange={(event) => meeting.setBookmarkInput(event.target.value)}
            type="text"
            data-cy="meetings-bookmark-input"
            value={meeting.bookmarkInput}
          />
        </Field>
        <Tappable
          className="btn btn-primary full-width"
          component="button"
          disabled={meeting.isCreatingBookmark}
          type="submit"
          data-cy="meetings-bookmark-submit"
          onClick={handleAddBookamrk}
        >
          Add Bookmark
        </Tappable>
      </form>
    </Modal>
  );
}

export default mobxify('meetingStore')(AddBookmarkModal);
