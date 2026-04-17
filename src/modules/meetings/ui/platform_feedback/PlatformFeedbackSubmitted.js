import React, { useEffect } from 'react';

import { Icon, Tappable } from '@common/ui/general';
import { SUBMITTED_STATE_TIMEOUT } from '~meetings/utils/platformFeedback';

function PlatformFeedbackSubmitted({ onClose }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, [SUBMITTED_STATE_TIMEOUT]);

    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="m-platform-feedback">
      <div className="m-platform-feedback__heading">
        <div className="row flex-ac">
          <Icon name="tick-circle" className="h3 m-r-5 success" />
          <div className="dark bold h3">Feedback Submitted Successfully!</div>
        </div>
        <Tappable
          className="h2 no-highlight"
          component={Icon}
          name="close"
          onClick={onClose}
        />
      </div>
      <div className="h4 dark m-t-15">
        Thank you for your feedback!
        It's invaluable in helping us serve you better.
      </div>
    </div>
  );
}

export default PlatformFeedbackSubmitted;
