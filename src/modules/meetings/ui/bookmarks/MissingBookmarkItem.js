import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import {
  Tappable, Textarea, Tooltip,
} from '@common/ui/general';
import { BOOKMARK_TYPES, CUE_CARD_TRACKING } from '~meetings/utils/constants';
import { canAddMissingBookmark } from '~meetings/utils/bookmarks';
import { mobxify } from '~meetings/ui/hoc';
import { useWidgetData } from '~meetings/hooks';
import { toast } from '@common/ui/general/Toast';
import alertRound from '~meetings/images/alert-round-red.svg';
import analytics from '@common/utils/analytics';
import analyticsOld from '~meetings/analytics';

function MissingBookmarkItem({
  id, title, contentType, onCreateBookmark, eventSource,
  meetingStore: store,
}) {
  const [isEditing, setEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [description, setDescription] = useState(title);
  const { meeting, archive } = store;
  const bookmarkDetail = { id, title, type: contentType };
  const { missingBookmarkActionRenderer } = useWidgetData() || {};

  const ref = useRef(null);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaAddBookmarkClick,
      click_source: DRONA_SOURCES.meetingMissingBookmarks,
      click_feature: DRONA_FEATURES.bookmark,
    });
    analyticsOld.click(
      CUE_CARD_TRACKING.addMissingBookmark,
      eventSource, {
        bookmark_name: title,
        meeting_name: meeting?.name,
        hosts: meeting?.namesFromAllHosts,
        meeting_date_time: meeting?.startTime,
      },
    );
    if (isSaving) return;

    setSaving(true);
    try {
      await onCreateBookmark(
        {
          playlistContentId: id,
          title: description,
          type: BOOKMARK_TYPES.cueCards,
        },
      );
      toast.show({
        message: 'Bookmark Added',
        type: 'success',
      });
      setSaving(false);
    } catch (error) {
      toast.show({
        message: 'Failed to add bookmark',
        type: 'error',
      });
      setSaving(false);
    }
  }, [isSaving, onCreateBookmark, id,
    description, title, meeting, eventSource]);

  const handleEdit = useCallback(() => {
    setEditing(true);
  }, []);

  const handleChange = useCallback((event) => {
    setDescription(event.target.value);
  }, []);

  function headerUi() {
    return (
      <div
        className={classNames(
          'm-bookmark-item__header',
          { 'm-bookmark-item__header--highlight': isEditing },
        )}
      >
        <div className="m-bookmark-item__title">
          <img alt="alert" src={alertRound} />
          <div className="m-bookmark-item__label">
            <span className="hint h5 no-mgn-b italic">
              Missing Bookmark
            </span>
          </div>
        </div>
      </div>
    );
  }

  function descriptionUi() {
    return (
      <div className="m-bookmark-item__content">
        <Tooltip
          className="m-bookmark-item__text"
          component={Textarea}
          maxRows={10}
          onFocus={handleEdit}
          onChange={handleChange}
          title="Click to edit and add bookmark"
          value={description}
        />
      </div>
    );
  }

  function footerUi() {
    return (
      <div className="m-bookmark-item__footer">
        {
          canAddMissingBookmark(contentType) ? (
            <div className="m-bookmark-item__footer-inner">
              <Tappable
                className="btn btn-primary full-width
              m-bookmark-item__footer-transition"
                component="button"
                type="submit"
                disabled={isSaving}
              >
                <span>Add Bookmark</span>
              </Tappable>
            </div>
          ) : null
        }
        {missingBookmarkActionRenderer
          && missingBookmarkActionRenderer({
            bookmark: bookmarkDetail,
            archiveData: archive,
          })}
      </div>
    );
  }

  return (
    <form
      className={classNames(
        'm-bookmark-item m-bookmark-item--shadow',
        'm-bookmark-item--editable',
        { 'm-bookmark-item--editing': isEditing },
      )}
      ref={ref}
      onSubmit={handleSubmit}
    >
      <div className="m-bookmark-item__main missing-bookmark-item">
        {headerUi()}
        {descriptionUi()}
        {footerUi()}
      </div>
    </form>
  );
}

export default mobxify('meetingStore')(MissingBookmarkItem);
