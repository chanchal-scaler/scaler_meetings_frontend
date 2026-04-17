import React from 'react';
import { useParams } from 'react-router';

import { InitializeBotMeeting, LoadBotMeeting } from '~meetings/components';
import { VIDEO_CONFIG } from '~meetings/utils/recordingConfig';
import VideoChannel from './VideoChannel';

function RecordingPage() {
  const { slug } = useParams();

  return (
    <div className="m-recording-page">
      <div
        style={{
          height: `${VIDEO_CONFIG?.height}px`,
          width: `${VIDEO_CONFIG?.width}px`,
        }}
        className="m-recording-page__main"
      >
        <LoadBotMeeting slug={slug}>
          <InitializeBotMeeting>
            <VideoChannel />
          </InitializeBotMeeting>
        </LoadBotMeeting>
      </div>
    </div>
  );
}

export default RecordingPage;
