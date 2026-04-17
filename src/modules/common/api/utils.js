/* eslint-disable no-param-reassign */
import fetch from 'isomorphic-fetch';
import map from 'lodash/map';
import pickBy from 'lodash/pickBy';
import { getURLWithUTMParams } from '@common/utils/url';

import { getDeviceType, getRequestSource } from '@common/utils/platform';
import { isNullOrUndefined } from '@common/utils/type';

let generatedJwtCache = null;
let generatedJwtPromise = null;

function getCookieValue(name) {
  const cookiePrefix = `${name}=`;
  const cookie = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(cookiePrefix));

  if (!cookie) return null;
  return decodeURIComponent(cookie.slice(cookiePrefix.length));
}

function getCsrfToken() {
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  if (csrfMeta?.content) return csrfMeta.content;

  // Vite local entry doesn't include Rails layout meta tags. Fall back to
  // cookie token so authenticated POST/PUT/PATCH/DELETE requests don't 403.
  return getCookieValue('XSRF-TOKEN');
}

function extractToken(payload) {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;
  if (typeof payload !== 'object') return null;

  return (
    payload.token
    || payload.jwt
    || payload.access_token
    || payload?.data?.token
    || payload?.data?.jwt
    || payload?.data?.access_token
    || null
  );
}

export function resetGeneratedJwt() {
  generatedJwtCache = null;
  generatedJwtPromise = null;
}

export async function resolveAuthToken() {
  if (generatedJwtCache) return generatedJwtCache;
  if (generatedJwtPromise) return generatedJwtPromise;

  generatedJwtPromise = (async () => {
    const csrfToken = getCsrfToken();

    try {
      const response = await fetch('/generate-jwt', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (response.status === 401 || response.status === 403 || !response.ok) {
        return null;
      }

      const rawText = (await response.text()).trim();
      let payload = rawText;
      try {
        payload = JSON.parse(rawText);
      } catch (error) {
        // Keep raw text payload for token extraction fallback.
      }

      const jwtToken = extractToken(payload);
      if (jwtToken) generatedJwtCache = jwtToken;
      return jwtToken;
    } catch (error) {
      return null;
    } finally {
      generatedJwtPromise = null;
    }
  })();

  return generatedJwtPromise;
}

export function searchParams(params, transformArray = false) {
  const cleanedParams = pickBy(params, (v) => !isNullOrUndefined(v));
  return map(cleanedParams, (value, key) => {
    if (transformArray && Array.isArray(value)) {
      return value.map(v => `${key}[]=${v}`).join('&');
    } else {
      return `${key}=${value}`;
    }
  }).join('&');
}

/**
 * Parses JSON responses for easier consumption.
 *
 * The returned promise behaves as follows:
 * * For "OK" responses (2xx status codes)
 *   * If the body has JSON, it resolves to the JSON itself
 *   * If the body has no JSON (i.e. is empty), it resolves to null
 * * For all other responses, it rejects with an `Error` object that contains
 *   the following properties:
 *   * `isFromServer`: Set to true, indicating it is a server error
 *   * `response`: The complete response, for reference if required
 *   * `responseJson`: The response body pre-converted to JSON for convenience
 *
 * @param {Object} response
 * @returns {Promise<{}>}
 */
export async function parseJsonResponse(response) {
  let json = null;
  try {
    json = await response.json();
  } catch (e) {
    // TODO Do something if response has no, or invalid JSON
  }

  if (response.headers.has('X-Flash-Messages')) {
    const flashHeader = response.headers.get('X-Flash-Messages') || '{}';
    const { error, notice } = JSON.parse(flashHeader) || {};
    if (error || notice) {
      json ||= {};
      json.flashError = error || notice;
    }

    if (error) {
      window.GTMtracker?.pushEvent({
        event: 'gtm_custom_click',
        data: {
          click_text: error,
          click_type: 'Flash error',
        },
      });
    }
  }

  if (response.ok) {
    return json;
  } else {
    const error = new Error(response.statusText);
    error.isFromServer = true;
    error.response = response;
    error.responseJson = json;

    throw error;
  }
}

/**
 * Performs an API request.
 *
 * @param {string} method - 'GET', 'POST' etc.
 * @param {string} path
 * @param {Object} [body]
 * @param {Object} [options] - `fetch` options other than `method` and `body`
 * @returns {Promise<{}>} As returned by {@link parseJsonResponse}
 */
export async function apiRequest(method, path, body = null, options = {}) {
  let defaultHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Accept-Flash': true,
  };

  const deviceType = getDeviceType();
  if (getRequestSource() === 'android') {
    defaultHeaders = {
      ...defaultHeaders,
      'X-REQUEST-SOURCE': 'AndroidApp',
    };
  } else {
    defaultHeaders = {
      ...defaultHeaders,
      'App-Name': deviceType,
    };
  }

  // TODO Remove DOM dependency from this file
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    defaultHeaders['X-CSRF-Token'] = csrfToken;
  }

  const defaultOptions = { method };

  if (options.dataType === 'FormData') {
    delete defaultHeaders['Content-Type'];
    defaultOptions.body = body;
  } else if (body && method !== 'GET') {
    defaultOptions.body = JSON.stringify(body);
  }

  const {
    headers,
    params,
    requireJwt = false,
    optionalAuth = false,
    ...remainingOptions
  } = options;

  let authToken = null;
  if (requireJwt) {
    authToken = await resolveAuthToken();
    if (!authToken && !optionalAuth) {
      const authError = new Error(
        'Could not generate auth token from /generate-jwt. Please log in and try again.',
      );
      authError.status = 401;
      throw authError;
    }
  }

  const finalOptions = Object.assign(
    defaultOptions,
    { headers: Object.assign(defaultHeaders, headers) },
    { credentials: 'same-origin' },
    remainingOptions,
  );

  if (authToken && !finalOptions.headers['X-User-Token']) {
    finalOptions.headers['X-User-Token'] = authToken;
  }

  finalOptions.referrer = getURLWithUTMParams();
  if (params) {
    path += `?${searchParams(params)}`;
  } else if (method === 'GET' && body) {
    path += `?${searchParams(body, true)}`;
  }

  let response = await fetch(path, finalOptions);

  if (requireJwt && (response.status === 401 || response.status === 403)) {
    resetGeneratedJwt();
    authToken = await resolveAuthToken();
    if (authToken) {
      finalOptions.headers['X-User-Token'] = authToken;
      response = await fetch(path, finalOptions);
    }
  }

  return parseJsonResponse(response);
}

export async function generateJWT() {
  const token = await resolveAuthToken();
  if (!token) {
    window.location = `${window.location.protocol}//${window.location.host}`
      + '/users/sign_in';
    return null;
  }
  return token;
}

export const ABORTED_ERROR_CODE = 20;
