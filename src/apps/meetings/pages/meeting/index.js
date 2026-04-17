import React from 'react';
import {
  Navigate, Route, Routes, useLocation, useParams,
} from 'react-router-dom';

import { LoadMeeting } from '~meetings/components';
import { meetingStatusLabel } from '~meetings/utils/meeting';
import { mobxify } from '~meetings/ui/hoc';
import { PageMeta } from '@common/ui/general';
import ArchivePage from '@meetings/pages/archive';
import LandscapeBlocker from './LandscapeBlocker';
import NoteBookAssociations from './NoteBookAssociations';
import LivePage from '@meetings/pages/live';
import UpcomingPage from '@meetings/pages/upcoming';

const meetingStatusPathMap = {
  upcoming: 'upcoming',
  ongoing: 'live',
  completed: 'archive',
};

function MeetingPage() {
  const { slug } = useParams();
  const { pathname } = useLocation();

  console.log({ slug, pathname });

  return (
    <LoadMeeting slug={slug}>
      {({ data }) => (
        <>
          <PageMeta
            title={`${meetingStatusLabel(data.status)} | ${data.name}`}
          />
          <NoteBookAssociations />
          <Routes>
            <Route path="upcoming" element={<UpcomingPage />} />
            <Route path="live" element={<LivePage />} />
            <Route path="archive" element={<ArchivePage />} />
            <Route
              index
              element={<Navigate to={meetingStatusPathMap[data.status]} replace />}
            />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <LandscapeBlocker />
        </>
      )}
    </LoadMeeting>
  );
}

export default mobxify('meetingStore')(MeetingPage);
