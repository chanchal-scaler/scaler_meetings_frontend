import React from 'react';
import { useParams } from 'react-router-dom';

import { mobxify } from '~meetings/ui/hoc';
import { NotesUpload } from '~meetings/ui/lecture_notes';
import { ActionTypes } from '~meetings/utils/attachments';
import { useQuery } from '@common/hooks';

function UploadPage({ attachmentStore }) {
  const { slug } = useParams();
  const { meetingName, isLoading } = attachmentStore;
  const { token: accessToken } = useQuery();

  const headingUi = () => {
    if (isLoading) {
      return <h2>Loading upload session</h2>;
    }
    return (
      <>
        <h3>Upload lecture notes for</h3>
        <h1>
          {meetingName}
        </h1>
      </>
    );
  };

  return (
    <div className="lecture-notes__upload-container">
      <div className="lecture-notes__center">
        {headingUi()}
      </div>
      <div className="lecture-notes__upload-body">
        <NotesUpload
          skipInstructions
          meetingSlug={slug}
          accessToken={accessToken}
          source={ActionTypes.QR_CODE_UPLOAD}
        />
      </div>
    </div>
  );
}

export default mobxify('attachmentStore')(UploadPage);
