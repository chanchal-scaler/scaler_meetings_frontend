import React, { useCallback, useRef, useState } from 'react';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { Tappable } from '@common/ui/general';
import { toast } from '@common/ui/general/Toast';
import { useActions, useGlobalState } from '~video_player/hooks';
import BookmarkInput from './BookmarkInput';
import TimeFollower from '~video_player/ui/general/TimeFollower';
import analytics from '@common/utils/analytics';

function AddBookmark({ onAdd, inputClassName }) {
  const ref = useRef();
  const [isSubmitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');

  const {
    bookmarkTime,
    currentSrc,
  } = useGlobalState();

  const { addBookmark, play } = useActions();

  const handleClose = useCallback(() => {
    addBookmark(null);
  }, [addBookmark]);

  const handleAdd = useCallback(async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setSubmitting(true);
    try {
      await onAdd({
        time: bookmarkTime,
        src: currentSrc,
        title,
      });
      addBookmark(null);
      setTitle('');
      play();
      toast.show({
        message: 'Bookmark added successfully',
      });
    } catch (error) {
      toast.show({
        message: 'Failed to add bookmark',
        type: 'error',
      });
    }
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaAddBookmarkClick,
      click_source: DRONA_SOURCES.meetingVideoPlayerControls,
      click_feature: DRONA_FEATURES.bookmark,
    });
    setSubmitting(false);
  }, [addBookmark, bookmarkTime, currentSrc, isSubmitting, onAdd, play, title]);

  if (bookmarkTime > 0) {
    return (
      <TimeFollower
        ref={ref}
        className="box vp-bookmark-popup vp-bookmark-add"
        component="form"
        onSubmit={handleAdd}
        time={bookmarkTime}
      >
        <BookmarkInput
          canEdit
          className={inputClassName}
          onChange={event => setTitle(event.target.value)}
          onClose={handleClose}
          onSubmit={handleAdd}
          placeholder="Add your notes here"
          time={bookmarkTime}
          title={title}
        />
        <div className="vp-bookmark-popup__footer">
          <div className="vp-bookmark-popup__hint">
            Enter to save, Shift+Enter for new line
          </div>
          <div className="vp-bookmark-popup__actions">
            <Tappable
              component="button"
              className="btn btn-primary btn-inverted btn-small bold"
              disabled={isSubmitting}
              type="submit"
            >
              Add Bookmark
            </Tappable>
          </div>
        </div>
      </TimeFollower>
    );
  } else {
    return null;
  }
}

export default AddBookmark;
