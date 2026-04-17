import React, { useCallback, useEffect, useState } from 'react';

import { Tappable } from '@common/ui/general';
import { dialog } from '@common/ui/general/Dialog';
import { toast } from '@common/ui/general/Toast';
import { useGlobalState, useActions } from '~video_player/hooks';
import BookmarkInput from './BookmarkInput';
import TimeFollower from '~video_player/ui/general/TimeFollower';

function EditBookmark({ onDelete, onUpdate }) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const { editingBookmark: bookmark, singletonsNamespace } = useGlobalState();
  const { editBookmark } = useActions();

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title);
    } else {
      setTitle('');
    }
  }, [bookmark]);

  const handleShow = useCallback(() => {
    editBookmark(bookmark);
  }, [bookmark, editBookmark]);

  const handleHide = useCallback(() => {
    editBookmark(null);
  }, [editBookmark]);

  const handleUpdate = useCallback(async (event) => {
    event.preventDefault();

    if (isSubmitting || !bookmark.canEdit) {
      return;
    }

    setSubmitting(true);
    try {
      await onUpdate({
        slug: bookmark.slug,
        title,
      });
      editBookmark(null);
      toast.show({
        message: 'Bookmark updated successfully',
      });
    } catch (error) {
      toast.show({
        message: 'Failed to update bookmark!',
        type: 'error',
      });
    }
    setSubmitting(false);
  }, [
    bookmark.canEdit, bookmark.slug, editBookmark, isSubmitting,
    onUpdate, title,
  ]);

  const handleDelete = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    dialog.areYouSure({
      name: singletonsNamespace,
      content: 'Proceeding will delete the bookmark and cannot be restored',
      onOk: async () => {
        setSubmitting(true);
        try {
          await onDelete(bookmark.slug);
          toast.show({ message: 'Bookmark deleted successfully!' });
        } catch (error) {
          toast.show({
            message: 'Failed to delete bookmark!',
            type: 'error',
          });
        }
        setSubmitting(false);
      },
    });
  }, [bookmark.slug, isSubmitting, onDelete, singletonsNamespace]);

  const handleMouseLeave = useCallback(() => {
    if (title === bookmark.title) {
      editBookmark(null);
    }
  }, [bookmark.title, editBookmark, title]);

  return (
    <TimeFollower
      className="box vp-bookmark-popup vp-bookmark-edit"
      component="form"
      onMouseEnter={handleShow}
      onMouseLeave={handleMouseLeave}
      onSubmit={handleUpdate}
      time={bookmark.time}
    >
      <BookmarkInput
        canEdit={bookmark.canEdit}
        className={bookmark.inputClassName}
        onClose={bookmark.canEdit && handleHide}
        placeholder="Add your notes here"
        time={bookmark.time}
        title={title}
        onChange={(event) => setTitle(event.target.value)}
        onSubmit={handleUpdate}
      />
      {bookmark.canEdit && (
        <div className="vp-bookmark-popup__footer">
          <div className="vp-bookmark-popup__hint">
            Enter to save, Shift+Enter for new line
          </div>
          <div className="vp-bookmark-popup__actions">
            <Tappable
              className="btn btn-danger btn-inverted btn-small bold"
              disabled={isSubmitting}
              onClick={handleDelete}
            >
              Delete
            </Tappable>
            <Tappable
              component="button"
              className="btn btn-primary btn-inverted btn-small bold m-l-5"
              disabled={isSubmitting}
              type="submit"
            >
              Save
            </Tappable>
          </div>
        </div>
      )}
    </TimeFollower>
  );
}

export default EditBookmark;
