import { apiRequest } from '@common/api/utils';
import { BASENAME, API_V3_BASE } from '~meetings/utils/constants';
import { normalizeResponse } from '@common/api/normalizer';

async function getPlaylist(playlistId, meetingId) {
  const response = await apiRequest(
    'GET',
    `${API_V3_BASE}/${meetingId}/playlists/${playlistId}`,
    null,
    { headers: { 'X-User-Token': window.__AUTH_TOKEN__ } },
  );
  return normalizeResponse(response).data[0];
}

async function getPlaylistContent(meetingId, playlistId, playlistContentId) {
  const response = await apiRequest(
    'GET',
    `${API_V3_BASE}/${meetingId}/`
    + `playlist-contents/${playlistContentId}`,
    null,
    { headers: { 'X-User-Token': window.__AUTH_TOKEN__ } },
  );
  return normalizeResponse(response).data;
}

async function getPlaylistContentSessions(meetingId) {
  const response = await apiRequest(
    'GET',
    `${API_V3_BASE}/${meetingId}/playlist-content-sessions`,
    null,
    { headers: { 'X-User-Token': window.__AUTH_TOKEN__ } },
  );
  return normalizeResponse(response);
}

async function startSession(meetingId,
  playlistContentId,
  updatedData = {}) {
  const response = await apiRequest(
    'POST',
    `${API_V3_BASE}/${meetingId}/playlist-content-sessions`, {
      playlist_content_id: playlistContentId,
      meeting_id: meetingId,
      updated_data: updatedData,
    },
    { headers: { 'X-User-Token': window.__AUTH_TOKEN__ } },
  );
  return normalizeResponse(response);
}

function stopSession(meetingSlug) {
  return apiRequest(
    'DELETE',
    `${BASENAME}/${meetingSlug}/playlists/sessions/`,
  );
}

function stopAllStreams(meetingSlug, playlistId) {
  return apiRequest(
    'DELETE',
    `${BASENAME}/${meetingSlug}/playlists/${playlistId}/streams`,
  );
}

export default {
  getPlaylist,
  getPlaylistContent,
  getPlaylistContentSessions,
  startSession,
  stopSession,
  stopAllStreams,
};
