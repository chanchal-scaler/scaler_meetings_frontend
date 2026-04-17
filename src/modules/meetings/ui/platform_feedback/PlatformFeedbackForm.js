import React, { useCallback, useState } from 'react';

import { PLATFORM_FEEDBACK_STAGES } from '~meetings/utils/platformFeedback';
import PlatformFeedbackDetails from './PlatformFeedbackDetails';
import PlatformFeedbackSubmitted from './PlatformFeedbackSubmitted';

function PlatformFeedbackForm({ onClose, meeting }) {
  const [
    currentStage, setCurrentStage,
  ] = useState(PLATFORM_FEEDBACK_STAGES.details);

  const handleClose = useCallback(() => {
    setCurrentStage(PLATFORM_FEEDBACK_STAGES.details);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    setCurrentStage(PLATFORM_FEEDBACK_STAGES.submitted);
  }, []);

  if (currentStage === PLATFORM_FEEDBACK_STAGES.details) {
    return (
      <PlatformFeedbackDetails
        onClose={handleClose}
        onSubmit={handleSubmit}
        meeting={meeting}
      />
    );
  } else if (currentStage === PLATFORM_FEEDBACK_STAGES.submitted) {
    return (
      <PlatformFeedbackSubmitted onClose={handleClose} />
    );
  }

  return null;
}

export default PlatformFeedbackForm;
