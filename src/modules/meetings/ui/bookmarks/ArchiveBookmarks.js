import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';

import {
  Chip, Icon, Tappable, Textarea,
} from '@common/ui/general';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { HintLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import { toast } from '@common/ui/general/Toast';
import { toCountdown } from '~video_player/utils/date';
import { useMediaQuery } from '@common/hooks';
import { CUE_CARD_TRACKING } from '~meetings/utils/constants';
import analytics from '@common/utils/analytics';
import analyticsOld from '~meetings/analytics';
import ArchiveBookmarkFilter from './ArchiveBookmarkFilter';
import BookmarkItem from './BookmarkItem';
import MissingBookmarkItem from './MissingBookmarkItem';
import HotKey from '@common/lib/hotKey';

function ArchiveBookmarks({ meetingStore: store }) {
  const [isEditing, setEditing] = useState(false);
  const { archive } = store;
  const { tablet } = useMediaQuery();

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    try {
      await archive.addBookmark();
    } catch (error) {
      toast.show({
        message: 'Failed to add bookmark',
        type: 'error',
      });
    }
  }, [archive]);

  const handleKeyDown = useCallback((event) => {
    if (tablet) {
      return;
    }

    const hotKey = new HotKey(event);
    if (hotKey.didPress('enter') && !hotKey.didPress('shift+enter')) {
      handleSubmit(event);
    }
  }, [handleSubmit, tablet]);

  useEffect(() => () => {
    // Anything in here is fired on component unmount.
    archive.setScrollToBookmarkSlug(null);
  }, [archive]);

  const handleSeek = useCallback((bookmark) => {
    const recording = archive.playlist.find(
      o => o.id === bookmark.video_id,
    );
    if (recording) {
      archive.setSelectedVideo({
        src: recording.src,
        resumeAt: bookmark.start_time,
      });
    }
  }, [archive]);

  const handleEdit = useCallback(() => {
    setEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setEditing(false);
  }, []);

  const handleAddBookmark = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaAddBookmarkClick,
      click_source: DRONA_SOURCES.meetingRecording,
      click_feature: DRONA_FEATURES.bookmark,
    });
    analyticsOld.click(
      CUE_CARD_TRACKING.addNewBookmark,
      'Archive Class Add Missing Bookmark', {
        bookmark_name: archive.bookmarkInput,
      },
    );
    archive.showBookmarkInput();
  }, [archive]);

  const handleDeleteBookmark = useCallback(async (slug) => {
    archive.deleteBookmark(slug);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaDeleteBookmark,
      click_source: DRONA_SOURCES.meetingRecording,
      click_feature: DRONA_FEATURES.bookmark,
      custom: {
        bookmark_slug: slug,
      },
    });
  }, [archive]);

  function bookmarkInputUi() {
    if (archive.bookmarkInputVisible) {
      return (
        <form
          className={classNames(
            'm-bookmark-item',
            { 'm-bookmark-item--admin': archive.isSuperHost },
            { 'm-bookmark-item--user': !archive.isSuperHost },
            { 'm-bookmark-item--editing': isEditing },
          )}
          onSubmit={handleSubmit}
        >
          <div className="m-bookmark-item__main">
            <div className="m-bookmark-item__header">
              <div className="m-bookmark-item__title">
                <Chip className="m-bookmark-item__timer">
                  {toCountdown(archive.currentTime)}
                </Chip>
              </div>
              <div className="m-bookmark-item__actions">
                {archive.isCreatingBookmark && (
                  <span className="h5 no-mgn-b">Saving...</span>
                )}
                <Tappable
                  className="btn btn-inverted btn-small btn-icon"
                  onClick={archive.hideBookmarkInput}
                >
                  <Icon name="clear" />
                </Tappable>
              </div>
            </div>
            <div className="m-bookmark-item__content">
              <Textarea
                autoFocus
                className="m-bookmark-item__text"
                minRows={3}
                maxRows={10}
                onBlur={handleBlur}
                onFocus={handleEdit}
                onKeyDown={handleKeyDown}
                onChange={event => archive.setBookmarkInput(event.target.value)}
                value={archive.bookmarkInput}
                placeholder="Add your notes here"
              />
            </div>
            <div className="m-bookmark-item__footer">
              <span
                className="m-bookmark-item__hint m-bookmark-item__hint--desktop"
              >
                <span className="m-bookmark-item__status">
                  Enter to save, Shift+Enter for new line
                </span>
              </span>
              <Tappable
                className="btn btn-primary btn-inverted btn-icon btn-small"
                component="button"
                type="submit"
              >
                <Icon name="send" />
              </Tappable>
            </div>
          </div>
        </form>
      );
    } else {
      return null;
    }
  }

  function listUi(list) {
    if (list.length > 0) {
      return (
        <div className="m-bookmarks__list">
          {list.map(bookmark => (
            <BookmarkItem
              key={bookmark.slug}
              bookmark={bookmark}
              onDeleteBookmark={handleDeleteBookmark}
              onUpdateBookmark={archive.updateBookmark}
              onHighlightComplete={() => archive.setScrollToBookmarkSlug(null)}
              onSeek={handleSeek}
              showLabels
              scrollToView={archive.scrollToBookmarkSlug === bookmark.slug}
              isMine={bookmark.user_id === parseInt(archive.user.user_id, 10)}
            />
          ))}
        </div>
      );
    } else {
      return (
        <HintLayout
          isFit
          isTransparent
          message="No bookmarks available"
        />
      );
    }
  }

  function sectionUi(section, index) {
    return (
      <div
        key={index}
        className="m-bookmarks__section"
      >
        <h4 className="dark normal m-h-10">
          {section.title}
        </h4>
        {listUi(section.bookmarks)}
      </div>
    );
  }

  function bookmarksUi() {
    if (!archive.hasBookmarks || archive.playlist.length === 0) {
      return (
        <HintLayout message="No bookmarks available" />
      );
    } else if (archive.playlist.length === 1) {
      return (
        <div className="m-bookmarks layout__content">
          {listUi(archive.currentBookmarks)}
        </div>
      );
    } else {
      return (
        <div className="m-bookmarks layout__content">
          {archive.allBookmarks.map(sectionUi)}
        </div>
      );
    }
  }

  function missingBookmarksUi() {
    return (
      <div className="m-bookmarks">
        <div className="m-bookmarks__list">
          {archive.missingBookmarks.map(bookmark => (
            <MissingBookmarkItem
              key={bookmark.id}
              id={bookmark.id}
              title={bookmark.name}
              contentType={bookmark.content_type}
              eventSource="Archive Class Add Missing Bookmark"
              onCreateBookmark={archive.addBookmark}
            />
          ))}
        </div>
      </div>
    );
  }

  function allBookmarksUi() {
    if (archive.hasMissingBookmarks) {
      return (
        <div className="layout__content">
          <div className="h4 bold p-h-10 m-t-10">
            Missing Bookmark
          </div>
          {missingBookmarksUi()}
          <div className="h4 bold p-h-10 m-t-10">
            Bookmarks
          </div>
          {bookmarksUi()}
        </div>
      );
    } else {
      return bookmarksUi();
    }
  }

  function addBookmarkUi() {
    if (!archive.bookmarkInputVisible) {
      return (
        <div className="p-10">
          <Tappable
            className="btn btn-primary bold full-width"
            onClick={handleAddBookmark}
          >
            Add Bookmark
          </Tappable>
        </div>
      );
    } else {
      return null;
    }
  }
  return (
    <div className="layout archive-layout m-bookmarks-container">
      <ArchiveBookmarkFilter />
      {addBookmarkUi()}
      {bookmarkInputUi()}
      {allBookmarksUi()}
    </div>
  );
}

export default mobxify('meetingStore')(ArchiveBookmarks);
