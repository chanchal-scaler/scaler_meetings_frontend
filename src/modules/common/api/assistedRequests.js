import { apiRequest } from '@common/api/utils';

/**
 * Fetches all the assisted requests
 * @param {Object} options - The options object.
 * @param {string} options.ownerId - The ID of the owner for whom
 * assisted requests are being retrieved.
 * @param {string} options.ownerType - The type of the owner
 * @param {string} options.assistType - Assist Type
 * @returns {Object} - A normalized JSON API response containing
 * all assisted requests.
 */
export function getAssistedRequests({ ownerId, ownerType, assistType }) {
  return apiRequest('GET', `/api/v3/assisted_requests/`, {
    owner_id: ownerId,
    owner_type: ownerType,
    assist_type: assistType,
  });
}
