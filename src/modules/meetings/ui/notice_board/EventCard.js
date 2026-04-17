import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { VIEW_TYPES } from '@vectord/analytics';

import {
  Accordion, Icon, Skeleton, Tappable, VectorIcon,
} from '@common/ui/general';
import {
  DRONA_FEATURES, DRONA_TRACKING_TYPES,
  DRONA_SOURCES,
} from '~meetings/utils/trackingEvents';
import { toHHmm, toDDMMM, toWeekDay } from '@common/utils/date';
import { toast } from '@common/ui/general/Toast';
import analytics from '@common/utils/analytics';

const CTA_STATES = {
  default: 'default',
  submitting: 'submitting',
  success: 'success',
};

/**
 * EventCard - A variant of NoticeBoardCard for displaying event cards
 * Requires below props to properly render the card
 * @param {NoticeBoardMemo} message
 * @returns {JSX.Element}
 */
function EventCard({
  onDelete, canDelete, message,
}) {
  const [ctaState, setCtaState] = useState(CTA_STATES.default);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    cardTitle, title, heroImage, subText, startTime, endTime,
    ctaText, ctaUrl, ctaMethod,
    submittingCtaText, submittedCtaText, ctaClickSuccess,
  } = JSON.parse(message.body) || {};

  const handleUpdateClickStatus = useCallback(() => {
    message.updateBody(JSON.stringify({
      ...JSON.parse(message.body),
      // persist the click success in message body
      ctaClickSuccess: true,
    }));
  }, [message]);

  useEffect(() => {
    if (ctaClickSuccess) {
      setCtaState(CTA_STATES.success);
    }
  }, [ctaClickSuccess]);

  const handleCtaClick = useCallback(() => {
    if (ctaState === CTA_STATES.default) {
      setCtaState(CTA_STATES.submitting);
      analytics.click({
        click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardEventCardClick,
        click_source: DRONA_SOURCES.meetingNoticeBoardTab,
        click_feature: DRONA_FEATURES.noticeBoard,
        custom: { link: ctaUrl },
      });

      fetch(ctaUrl, { method: ctaMethod })
        .then((res) => res.json())
        .then((res) => {
          if (!res.success) throw new Error(res.message);

          setCtaState(CTA_STATES.success);
          handleUpdateClickStatus();
          analytics.view({
            view_name: DRONA_TRACKING_TYPES
              .dronaNoticeBoardEventCardSuccessView,
            view_type: VIEW_TYPES.section,
            view_feature: DRONA_FEATURES.noticeBoard,
            view_source: DRONA_SOURCES.meetingNoticeBoardTab,
          });
        })
        .catch((error) => {
          setCtaState(CTA_STATES.default);
          analytics.click({
            click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardEventCardErrorView,
            click_source: DRONA_SOURCES.meetingNoticeBoardTab,
            click_feature: DRONA_FEATURES.noticeBoard,
            custom: { link: ctaUrl },
          });
          toast.show({
            message: error?.message || 'Something went wrong',
            type: 'error',
          });
        });
    }
  }, [ctaMethod, ctaState, ctaUrl, handleUpdateClickStatus]);

  const handleDeleteClick = useCallback((e) => {
    onDelete(message.pinId);
    e.stopPropagation();
  }, [onDelete, message.pinId]);

  const parsedCtaText = () => {
    switch (ctaState) {
      case CTA_STATES.submitting:
        return submittingCtaText || ctaText;
      case CTA_STATES.success:
        return submittedCtaText || ctaText;
      default:
        return ctaText;
    }
  };

  return (
    <Accordion
      isOpen={isExpanded}
      defaultOpen={isExpanded}
      className="m-nb-event-card"
      onChange={setIsExpanded}
      title={({ onClick }) => (
        <div
          className="m-nb-event-card__header"
          onClick={onClick}
          role="presentation"
        >
          {cardTitle && (<span>{cardTitle}</span>)}
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
      <>
        {heroImage && (
          <>
            <img
              src={heroImage}
              alt={title}
              className={classNames(
                'm-nb-event-card__img',
                { 'm-nb-event-card__img--loading': !isImageLoaded },
              )}
              onLoad={() => setIsImageLoaded(true)}
            />
            {!isImageLoaded && <Skeleton variant="rect" height={80} />}
          </>
        )}
        <div className="m-nb-event-card__title">{title}</div>
        {subText && (
          <div className="m-nb-event-card__author">{subText}</div>
        )}
        {startTime && (
          <div className="m-nb-event-card--time">
            <div className="m-nb-event-card--time">
              <VectorIcon name="calender" />
              <span>{`${toDDMMM(startTime)} (${toWeekDay(startTime)})`}</span>
            </div>
            {endTime && (
              <>
                <div className="m-nb-event-card--seperator" />
                <div className="m-nb-event-card--time">
                  <VectorIcon name="clock" />
                  <span>{toHHmm(startTime)}</span>
                  {' - '}
                  <span>{toHHmm(endTime)}</span>
                </div>
              </>
            )}
          </div>
        )}
        <div className="m-nb-event-card__button-container">
          {ctaText && (
            <Tappable
              className={classNames(
                {
                  'm-nb-event-card__btn-success': ctaState === CTA_STATES
                    .success,
                },
                { 'btn-outlined': ctaState !== CTA_STATES.success },
                'btn m-nb-event-card__button',
              )}
              onClick={handleCtaClick}
              disabled={ctaState === CTA_STATES.submitting}
            >
              {parsedCtaText()}
            </Tappable>
          )}
          <div className="m-notice-board-card-timestamp">
            {toHHmm(message.timestamp)}
          </div>
        </div>
      </>
    </Accordion>
  );
}

export default EventCard;
