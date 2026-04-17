import React, { useCallback } from 'react';
import classNames from 'classnames';

import { DISABLE_HTML_REMARKABLE_OPTIONS } from '@common/utils/remarkable';
import {
  DRONA_FEATURES, DRONA_TRACKING_TYPES,
  DRONA_SOURCES,
} from '~meetings/utils/trackingEvents';
import { MdRenderer } from '@common/ui/markdown';
import { toHHmm } from '@common/utils/date';
import { Tappable, Icon } from '@common/ui/general';
import analytics from '@common/utils/analytics';

function NoticeBoardCard({
  onDelete, canDelete, message,
}) {
  const {
    title, description, cta_title: ctaTitle, cta_link: ctaLink,
  } = JSON.parse(message.body);

  const handleDeleteClick = useCallback((e) => {
    onDelete(message.pinId);
    e.stopPropagation();
  }, [onDelete, message.pinId]);

  const handleCardClick = useCallback(() => {
    if (ctaLink) {
      window.open(ctaLink, '_blank');
    }
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardItemClick,
      click_source: DRONA_SOURCES.meetingNoticeBoardTab,
      click_feature: DRONA_FEATURES.noticeBoard,
      custom: {
        hasLink: !!ctaLink,
        link: ctaLink,
      },
    });
  }, [ctaLink]);

  const handleLinkClick = useCallback((event) => {
    window.open(ctaLink, '_blank');
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardLinkClick,
      click_source: DRONA_SOURCES.meetingNoticeBoardTab,
      click_feature: DRONA_FEATURES.noticeBoard,
      custom: {
        link: ctaLink,
      },
    });
    event.stopPropagation();
  }, [ctaLink]);

  return (
    <Tappable
      className={classNames(
        'm-notice-board-card no-highlight',
        { 'm-notice-board-card--with-link': ctaLink },
      )}
      onClick={handleCardClick}
    >
      <div className="m-notice-board-card-header">
        <div className="m-notice-board-card-header__title">
          <MdRenderer
            options={DISABLE_HTML_REMARKABLE_OPTIONS}
            mdString={title}
          />
        </div>
        {canDelete && (
          <Tappable
            component={Icon}
            name="trash-new"
            className="no-highlight h5"
            onClick={handleDeleteClick}
          />
        )}
      </div>
      {description && (
        <div className="m-notice-board-card-description">
          <MdRenderer
            options={DISABLE_HTML_REMARKABLE_OPTIONS}
            mdString={description}
          />
        </div>
      )}
      <div className="m-notice-board-card-footer">
        {ctaLink && (
          <Tappable
            className="m-notice-board-card-link no-highlight"
            onClick={handleLinkClick}
          >
            <span className="m-r-5">{ctaTitle}</span>
            <Icon name="external-link" />
          </Tappable>
        )}
        <div className="m-notice-board-card-timestamp">
          {toHHmm(message.timestamp)}
        </div>
      </div>
    </Tappable>
  );
}

export default NoticeBoardCard;
