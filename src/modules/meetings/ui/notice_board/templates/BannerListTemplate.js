import React, { useCallback, useState } from 'react';

import {
  Accordion, Icon, LottieAnimation, Tappable,
} from '@common/ui/general';
import {
  DRONA_FEATURES, DRONA_SOURCES, DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { useComponentViewedTracking } from '@common/hooks';
import { toHHmm } from '@common/utils/date';
import analytics from '@common/utils/analytics';
import linkIcon from '~meetings/images/link-icon.svg';

function BannerListTemplate({ onDelete, canDelete, message }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleDeleteClick = useCallback((e) => {
    onDelete(message?.pinId);
    e.stopPropagation();
  }, [onDelete, message]);

  const parsedMessage = JSON.parse(message.body || '{}');
  const {
    banner_url: bannerUrl,
    banner_type: bannerType,
    cta_text: ctaText,
    cta_url: ctaUrl,
    title,
    list_items: listItems,
  } = parsedMessage;

  const handleLinkClick = useCallback((event) => {
    window.open(ctaUrl, '_blank');
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardLinkClick,
      click_source: DRONA_SOURCES.meetingNoticeBoardTab,
      click_feature: DRONA_FEATURES.noticeBoard,
      custom: {
        link: ctaUrl,
      },
    });
    event.stopPropagation();
  }, [ctaUrl]);

  const ref = useComponentViewedTracking({
    analytics,
    eventName: DRONA_TRACKING_TYPES.dronaNoticeBoardBannerListTemplateView,
    source: DRONA_SOURCES.meetingNoticeBoardTab,
    payload: parsedMessage,
    track: message.body,
    unique: false,
  });

  const BannerAsset = () => {
    switch (bannerType) {
      case 'image':
        return (
          <img
            className="m-nb-banner-list-temp__banner"
            src={bannerUrl}
            alt="Banner"
          />
        );
      case 'video':
        return (
          <video
            className="m-nb-banner-list-temp__banner"
            src={bannerUrl}
            autoPlay
            loop
            alt="Banner"
          />
        );
      case 'lottie':
        return (
          <LottieAnimation
            autoPlay
            loop
            mode="normal"
            src={bannerUrl}
            className="m-nb-banner-list-temp__banner"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Accordion
      ref={ref}
      isOpen={isExpanded}
      defaultOpen={isExpanded}
      className="m-nb-banner-list-temp"
      onChange={setIsExpanded}
      title={({ onClick }) => (
        <div
          className="m-nb-banner-list-temp__header"
          onClick={onClick}
          role="presentation"
        >
          <div className="m-nb-banner-list-temp__title">{title}</div>
          {canDelete ? (
            <Tappable
              component={Icon}
              name="trash-new"
              className="no-highlight h5"
              onClick={handleDeleteClick}
            />
          ) : (
            <Tappable
              component={Icon}
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              className="no-highlight h5"
              onClick={onClick}
            />
          )}
        </div>
      )}
    >
      {message.body
        ? (
          <>
            <BannerAsset />
            <div className="m-nb-banner-list-temp__list">
              {listItems?.map((item) => (
                <div className="m-nb-banner-list-temp__list-item">
                  <img
                    className="m-nb-banner-list-temp__list-item-icon"
                    src={item.image_url}
                    alt="Banner"
                  />
                  <div className="m-nb-banner-list-temp__list-item-text">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="m-nb-banner-list-temp__footer">
              {ctaText && (
                <div className="m-nb-banner-list-temp__cta">
                  <button
                    type="submit"
                    onClick={handleLinkClick}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="m-nb-banner-list-temp__cta-link"
                  >
                    {ctaText}
                    <img
                      className="m-nb-banner-list-temp__cta-icon"
                      src={linkIcon}
                      alt="link"
                    />
                  </button>
                </div>
              )}
              <div className="m-nb-banner-list-temp__timestamp">
                {toHHmm(message.timestamp)}
              </div>
            </div>
          </>
        )
        : (
          <div className="m-nb-banner-list-temp__placeholder">
            Select a template to preview
          </div>
        )}
    </Accordion>
  );
}

export default BannerListTemplate;
