import React from 'react';

import { AdiosBanner } from '~meetings/ui/meeting';
import { AdiosPluginsRenderer } from '~meetings/plugins/components';
import { NotesUpload } from '~meetings/ui/lecture_notes';
import {
  hasAttachments, ActionTypes,
} from '~meetings/utils/attachments';
import { mobxify } from '~meetings/ui/hoc';
import BookmarkReminder from './BookmarkReminder';

function Adios({ meetingStore: store, pluginsStore, customComponent }) {
  const { meeting, slug } = store;
  const { type } = meeting;

  function messageUi() {
    switch (meeting.endType) {
      case 'forced':
        return 'Meeting has been ended by the host';
      case 'banned':
        return 'Host has banned you from the meeting. '
          + 'Please contact info@scaler.com if you have any discrepancy.';
      default:
        return 'You have left the meeting';
    }
  }

  function feedbackUi() {
    if (pluginsStore.adiosPlugins.length > 0) {
      return <AdiosPluginsRenderer plugins={pluginsStore.adiosPlugins} />;
    } else {
      return null;
    }
  }

  return (
    <div className="adios">
      <div className="adios__message">
        {messageUi()}
      </div>
      {meeting && meeting.isSuperHost && hasAttachments(type)
        ? (
          <div className="adios__instructions">
            <NotesUpload
              source={ActionTypes.MEETING_END_UPLOAD}
              meetingSlug={slug}
            />
            <BookmarkReminder />
          </div>
        ) : (
          feedbackUi()
        )}
      {meeting.hasBanner && (
        <AdiosBanner
          bannerData={meeting.banner}
          showButton={meeting.isFeedbackSubmitted}
        />
      )}
      {!!customComponent && customComponent}
    </div>
  );
}

export default mobxify('meetingStore', 'pluginsStore')(Adios);
