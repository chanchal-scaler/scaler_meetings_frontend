import { apiRequest } from '@common/api/utils';
import { API_V3_BASE, BASENAME } from '~meetings/utils/constants';
import { normalizeResponse } from '@common/api/normalizer';
import { meetingApiRequest } from './baseMeetingApi';

function getLiveBookmarks(slug) {
  return apiRequest(
    'GET',
    `${BASENAME}/${slug}/bookmarks/live`,
  );
}

function createBookmark(slug, data, playlistContentId) {
  return apiRequest(
    'POST',
    `${BASENAME}/${slug}/bookmarks`,
    { bookmark: data, playlist_content_id: playlistContentId },
  );
}

function createLiveBookmark(slug, data) {
  return meetingApiRequest(
    'POST',
    `${BASENAME}/${slug}/bookmarks/live`,
    { bookmark: data },
  );
}

function syncPlayingTime(slug, data) {
  return apiRequest(
    'POST',
    `${BASENAME}/${slug}/bookmarks/current-time/`,
    data,
  );
}

function updateBookmark(slug, data) {
  return apiRequest(
    'PUT',
    `${BASENAME}/${slug}/bookmarks/${data.slug}`,
    { bookmark: data },
  );
}

function deleteBookmark(slug, bookmarkSlug) {
  return apiRequest(
    'DELETE',
    `${BASENAME}/${slug}/bookmarks/${bookmarkSlug}`,
  );
}

async function getMissingBookmarks(meetingId) {
  const response = await apiRequest(
    'GET',
    `${API_V3_BASE}/${meetingId}/playlist-contents/missing-bookmarks`,
    null,
    { headers: { 'X-User-Token': window.__AUTH_TOKEN__ } },
  );
  return normalizeResponse(response).data;
}

export default {
  create: createBookmark,
  createLive: createLiveBookmark,
  update: updateBookmark,
  delete: deleteBookmark,
  syncPlayingTime,
  getLive: getLiveBookmarks,
  getMissingBookmarks,
};
