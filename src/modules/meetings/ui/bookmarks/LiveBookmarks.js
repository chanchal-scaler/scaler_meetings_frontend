import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';

import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import { Tappable, Tooltip } from '@common/ui/general';
import { toast } from '@common/ui/general/Toast';
import BookmarkItem from './BookmarkItem';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { UserAuthenticationError } from '~meetings/errors';
import analytics from '@common/utils/analytics';

function LiveBookmarks({ meetingStore: store }) {
  const { meeting } = store;
  const mobilePanelAlreadyExpandedRef = useRef(false);

  useEffect(() => {
    meeting.loadBookmarks();
    if (meeting.recording) {
      meeting.recording.load();
    }

    return () => meeting.setScrollToBookmarkSlug(null);
  }, [meeting]);

  const handleCreate = useCallback(async () => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaAddBookmarkClick,
      click_source: DRONA_SOURCES.meetingRightSideDock,
      click_feature: DRONA_FEATURES.bookmark,
    });
    try {
      await meeting.addBookmark();
    } catch (error) {
      if (!(error instanceof UserAuthenticationError)) {
        toast.show({
          message: 'Failed to add bookmark',
          type: 'error',
        });
      }
    }
  }, [meeting]);

  const handleBookmarkDelete = useCallback(async (slug) => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaDeleteBookmark,
      click_source: DRONA_SOURCES.meetingRightSideDock,
      click_feature: DRONA_FEATURES.bookmark,
      custom: {
        bookmark_slug: slug,
      },
    });
    meeting.deleteBookmark(slug);
  }, [meeting]);

  const handleExpand = useCallback(() => {
    mobilePanelAlreadyExpandedRef.current = meeting.isMobilePanelExpanded;
    meeting.setMobilePanelExpanded(true);
  }, [meeting]);

  const handleCollapse = useCallback(() => {
    // If mobile panel was expanded manually then do not auto close it when
    // bookmark input is blurred
    if (mobilePanelAlreadyExpandedRef.current) {
      return;
    }
    meeting.setMobilePanelExpanded(false);
  }, [meeting]);

  function listUi() {
    if (meeting.isLoadingBookmarks) {
      return <LoadingLayout />;
    } else if (meeting.loadingBookmarksError) {
      return (
        <HintLayout
          actionFn={() => meeting.loadBookmarks()}
          message="Failed to load bookmarks"
        />
      );
    } else if (!meeting.hasBookmarks) {
      return <HintLayout message="No bookmarks added" />;
    } else {
      return (
        <div className="m-bookmarks__list">
          {meeting.allBookmarks.map(bookmark => (
            <BookmarkItem
              key={bookmark.slug}
              bookmark={bookmark}
              onDeleteBookmark={handleBookmarkDelete}
              onEditStart={handleExpand}
              onEditDone={handleCollapse}
              onUpdateBookmark={meeting.updateBookmark}
              inEditState={meeting.scrollToBookmarkSlug === bookmark.slug}
              isMine={String(bookmark.user_id) === meeting.userId}
            />
          ))}
        </div>
      );
    }
  }

  const recordingActive = (meeting.recording && meeting.recording.isActive);

  return (
    <div className="layout__content">
      <div className="layout">
        <div className="p-10">
          <Tooltip
            className={classNames(
              'btn btn-primary bold full-width m-b-5',
              { 'btn-disabled': !recordingActive },
            )}
            component={Tappable}
            disabled={meeting.isCreatingBookmark}
            isDisabled={recordingActive}
            onClick={handleCreate}
            title="Session is not being recorded."
            popoverProps={{
              placement: 'left',
              margin: {
                left: -5,
              },
            }}
          >
            Add Bookmark
          </Tooltip>
          <span className="hint h6">
            Add your bookmark notes from here and review them later
          </span>
        </div>
        <div className="m-bookmarks layout__content">
          {listUi()}
        </div>
      </div>
    </div>
  );
}

export default mobxify('meetingStore')(LiveBookmarks);
