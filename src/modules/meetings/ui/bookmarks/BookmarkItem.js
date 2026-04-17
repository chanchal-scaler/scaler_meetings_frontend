import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import classNames from 'classnames';

import {
  Chip,
  Icon,
  Tappable,
  Textarea,
  Tooltip,
} from '@common/ui/general';
import { dialog } from '@common/ui/general/Dialog';
import { isInViewport, scrollToElement } from '@common/utils/dom';
import { mobxify } from '~meetings/ui/hoc';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import { toast } from '@common/ui/general/Toast';
import { toCountdown } from '~video_player/utils/date';
import { useMediaQuery, useThrottled, useUnmountedRef } from '@common/hooks';
import HotKey from '@common/lib/hotKey';

const typeClassNamesMap = {
  admin: 'm-bookmark-item--admin',
  user: 'm-bookmark-item--user',
  question: 'm-bookmark-item--question',
};

const typeIconsMap = {
  admin: 'board-teacher',
  user: 'bookmark',
  question: 'question-fill',
};

const typeLabelsMap = {
  admin: 'Marked by host',
  user: 'Marked by you',
  question: 'Question',
};

const UPDATE_INTERVAL = 3000; // In ms
const HIGHLIGHT_TIMEOUT = 500; // In ms
const OFFSET_TOP = 200;

function BookmarkItem({
  bookmark,
  onDeleteBookmark,
  onEditStart,
  onEditDone,
  onUpdateBookmark,
  onHighlightComplete,
  onSeek,
  showLabels,
  scrollToView,
  isMine,
  inEditState,
}) {
  const [isEditing, setEditing] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [highlighted, setHighlighted] = useState(false);
  const [autoSave, setAutoSave] = useState(false);

  const ref = useRef();
  const inputRef = useRef();
  const unmountedRef = useUnmountedRef();

  const { tablet } = useMediaQuery();

  const canEdit = isMine && bookmark.bookmark_type !== 'question';
  const hasUnsavedChanges = (
    description !== (
      bookmark.description || bookmark.title
    )
  );

  useEffect(() => {
    if (!isEditing && !isSaving) {
      setDescription(bookmark.description || bookmark.title);
    }
    // eslint-disable-next-line
  }, [bookmark.description, bookmark.title]);

  useEffect(() => {
    if (highlighted) {
      if (onHighlightComplete) {
        onHighlightComplete();
      }
      const timeout = setTimeout(() => {
        setHighlighted(false);
      }, HIGHLIGHT_TIMEOUT);

      return () => clearTimeout(timeout);
    }

    return undefined;
    // eslint-disable-next-line
  }, [highlighted]);

  useEffect(() => {
    if (scrollToView) {
      if (isInViewport(ref.current, OFFSET_TOP)) {
        setHighlighted(true);
      } else {
        scrollToElement(ref.current, 50, () => {
          if (!unmountedRef.current) {
            setHighlighted(true);
          }
        });
      }
    }
  }, [scrollToView, unmountedRef]);

  const handleDelete = useCallback(() => {
    if (isDeleting || isSaving) {
      return;
    }
    setDeleting(true);
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content: 'Proceed will delete the bookmark and cannot be restored.',
      onOk: async () => {
        try {
          await onDeleteBookmark(bookmark.slug);
          toast.show({ message: 'Bookmark deleted' });
        } catch (error) {
          toast.show({
            message: 'Failed to delete bookmark',
            type: 'error',
          });
        }
      },
    });
    setDeleting(false);
  }, [onDeleteBookmark, bookmark.slug, isSaving, isDeleting]);

  const handleAutoSave = useThrottled(async () => {
    setAutoSave(true);
  }, UPDATE_INTERVAL, []);

  const handleUpdate = useCallback(async () => {
    const prevDescription = bookmark.description || bookmark.title;
    if (isDeleting || isSaving || description === prevDescription) {
      return;
    }

    if (!unmountedRef.current) {
      setSaving(true);
    }

    try {
      await onUpdateBookmark({ slug: bookmark.slug, description });
    } catch (error) {
      toast.show({
        message: 'Failed to update bookmark',
        type: 'error',
      });
    }

    if (!unmountedRef.current) {
      setSaving(false);
    }
  }, [
    bookmark.description, bookmark.title, bookmark.slug, isDeleting, isSaving,
    description, unmountedRef, onUpdateBookmark,
  ]);

  // Hook that auto saves notes to server
  useEffect(() => {
    async function saveProgress() {
      try {
        await handleUpdate();
      } finally {
        setAutoSave(false);
      }
    }

    if (autoSave) {
      saveProgress();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSave]);

  const handleEdit = useCallback(() => {
    if (!canEdit) {
      return;
    }
    setEditing(true);

    if (onEditStart) {
      onEditStart();
    }
  }, [canEdit, onEditStart]);

  const handleBlur = useCallback(() => {
    setEditing(false);
    handleUpdate();

    if (onEditDone) {
      onEditDone();
    }
  }, [handleUpdate, onEditDone]);

  const handleChange = useCallback((event) => {
    setDescription(event.target.value);
    handleAutoSave();
  }, [handleAutoSave]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    handleUpdate();
  }, [handleUpdate]);

  const handleSeek = useCallback(() => {
    if (onSeek) {
      onSeek(bookmark);
    }
  }, [bookmark, onSeek]);

  useEffect(() => {
    if (inEditState && inputRef.current) {
      inputRef.current.focus();
      handleEdit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inEditState]);

  const handleKeyDown = useCallback((event) => {
    if (tablet) {
      return;
    }

    const hotKey = new HotKey(event);
    if (hotKey.didPress('enter') && !hotKey.didPress('shift+enter')) {
      event.preventDefault();
      inputRef.current.blur();
      handleUpdate();
    }
  }, [handleUpdate, tablet]);

  function headerUi() {
    return (
      <div
        className={classNames(
          'm-bookmark-item__header',
          { 'm-bookmark-item__header--highlight': isEditing },
        )}
      >
        <div className="m-bookmark-item__title">
          <Chip
            className={classNames(
              'm-bookmark-item__timer',
              { cursor: Boolean(onSeek) },
            )}
            onClick={handleSeek}
          >
            {toCountdown(bookmark.start_time)}
          </Chip>
          {showLabels && (
            <div className="m-bookmark-item__label">
              <Icon name={typeIconsMap[bookmark.bookmark_type]} />
              <span className="hint h5 no-mgn-b italic">
                {typeLabelsMap[bookmark.bookmark_type]}
              </span>
            </div>
          )}
        </div>
        <div className="m-bookmark-item__actions">
          {canEdit && (
            <Tappable
              className="
                btn btn-inverted btn-small btn-icon m-bookmark-item__delete
              "
              disabled={isSaving || isDeleting}
              onClick={handleDelete}
            >
              <Icon name="trash" />
            </Tappable>
          )}
        </div>
      </div>
    );
  }

  function descriptionUi() {
    return (
      <div className="m-bookmark-item__content">
        <Tooltip
          ref={inputRef}
          className="m-bookmark-item__text"
          component={Textarea}
          disabled={!canEdit}
          isDisabled={!canEdit || isEditing}
          maxRows={10}
          onBlur={handleBlur}
          onClick={handleEdit}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Add your notes here"
          title="Click to edit"
          value={description}
        />
      </div>
    );
  }

  function saveStatusUi() {
    if (isSaving) {
      return (
        <span className="m-bookmark-item__hint">
          <span className="m-bookmark-item__dot" />
          <span className="m-bookmark-item__status">
            Saving...
          </span>
        </span>
      );
    } else if (isEditing) {
      return (
        <span className="m-bookmark-item__hint m-bookmark-item__hint--desktop">
          <span className="m-bookmark-item__status">
            Shift+Enter for new line
          </span>
        </span>
      );
    } else if (hasUnsavedChanges) {
      return (
        <Tooltip
          className="m-bookmark-item__hint m-bookmark-item__hint--failed"
          title="Click to save"
          onClick={handleUpdate}
        >
          <span className="m-bookmark-item__dot" />
          <span className="m-bookmark-item__status">
            Unsaved changes
          </span>
        </Tooltip>
      );
    } else {
      return <span className="m-bookmark-item__hint" />;
    }
  }

  return (
    <form
      className={classNames(
        'm-bookmark-item m-bookmark-item--shadow',
        { 'm-bookmark-item--editable': canEdit },
        { 'm-bookmark-item--editing': isEditing },
        { 'm-bookmark-item--highlighted': highlighted },
        typeClassNamesMap[bookmark.bookmark_type],
      )}
      ref={ref}
      onSubmit={handleSubmit}
    >
      <div className="m-bookmark-item__main">
        {headerUi()}
        {descriptionUi()}
        {canEdit && (
          <div className="m-bookmark-item__footer">
            {saveStatusUi()}
            <Tappable
              className={classNames(
                'btn btn-primary btn-inverted btn-icon btn-small',
                'm-bookmark-item__submit',
                {
                  'm-bookmark-item__submit--visible': (
                    isEditing
                    && hasUnsavedChanges
                  ),
                },
              )}
              component="button"
              type="submit"
            >
              <Icon name="send" />
            </Tappable>
          </div>
        )}
      </div>
    </form>
  );
}

export default mobxify('meetingStore')(BookmarkItem);
