import React, { useCallback, useState } from 'react';

import {
  DRONA_FEATURES, DRONA_TRACKING_TYPES,
  DRONA_SOURCES,
} from '~meetings/utils/trackingEvents';
import {
  formatFeedbackResponse, MAX_RATING,
} from '~meetings/utils/platformFeedback';
import {
  Icon, Textarea, Tappable, Tooltip,
} from '@common/ui/general';
import { MEETING_ACTION_TRACKING } from '~meetings/utils/constants';
import { toast } from '@common/ui/general/Toast';
import analytics from '@common/utils/analytics';
import platformFeedbackApi from '~meetings/api/platformFeedback';
import starRatingFilled from '~meetings/images/star-rating-filled.svg';
import starRatingOutlined from '~meetings/images/star-rating-outlined.svg';

function PlatformFeedbackDetails({ onClose, onSubmit, meeting }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleFeedbackChange = useCallback((e) => {
    setFeedback(e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const response = formatFeedbackResponse({
        feedbackForms: meeting?.feedbackForms, rating, feedback,
      });
      await platformFeedbackApi.submitFeedback({
        meetingSlug: meeting?.slug,
        payload: response,
      });
      onSubmit();
      meeting.trackEvent(
        MEETING_ACTION_TRACKING.platformFeedbackSubmitted,
        { rating, feedback },
      );
      analytics.click({
        click_type: DRONA_TRACKING_TYPES.platformFeedbackSubmitted,
        click_feature: DRONA_FEATURES.platformFeedback,
        click_source: DRONA_SOURCES.meetingTopNavBar,
        custom: {
          rating,
          feedback,
        },
      });
    } catch (error) {
      meeting.trackEvent(
        MEETING_ACTION_TRACKING.platformFeedbackSubmitError,
        { error: error?.message },
      );
      analytics.log({
        log_type: DRONA_TRACKING_TYPES.platformFeedbackSubmitError,
        log_feature: DRONA_FEATURES.platformFeedback,
        log_source: DRONA_SOURCES.meetingTopNavBar,
        log_text: error?.message || 'Something went wrong!',
        custom: {
          rating,
          feedback,
          hasError: true,
          errorMessage: error?.message || 'Something went wrong!',
          error,
        },
      });
      toast.show(
        { message: 'Something went wrong.', type: 'error' },
      );
      onClose();
    }
  }, [feedback, meeting, onClose, onSubmit, rating]);

  return (
    <div className="m-platform-feedback">
      <div className="m-platform-feedback__heading">
        <div className="dark bold h3">Rate Meeting Platform Experience</div>
        <Tappable
          className="h2 no-highlight"
          component={Icon}
          name="close"
          onClick={onClose}
        />
      </div>
      <div className="m-platform-feedback-details">
        <div className="dark bold m-t-15">
          How would you rate your platform experience?
        </div>
        <div className="row flex-ac m-t-10">
          {Array.from({ length: MAX_RATING }).map((_, id) => (
            <Tappable
              key={id}
              component="img"
              className="m-platform-feedback-rating-input no-highlight"
              src={id < rating ? starRatingFilled : starRatingOutlined}
              alt="rating"
              onClick={() => setRating(id + 1)}
            />
          ))}
        </div>
        <Textarea
          onChange={handleFeedbackChange}
          value={feedback}
          placeholder="Please add your feedback in a bit more detail"
          className="m-platform-feedback-text-input"
          required={false}
        />
        <div className="m-platform-feedback-details-submit">
          <Tooltip
            isDisabled={rating !== 0}
            popoverProps={{ placement: 'bottom' }}
            title="Please provide rating to submit feedback."
          >
            <Tappable
              onClick={handleSubmit}
              disabled={rating === 0}
              className="btn btn-long btn-primary btn-rounded"
            >
              Submit
            </Tappable>
          </Tooltip>

        </div>
      </div>
    </div>
  );
}

export default PlatformFeedbackDetails;
