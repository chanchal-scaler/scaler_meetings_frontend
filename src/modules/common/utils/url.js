import qs from 'query-string';
import _urlJoin from 'url-join';
import { getCookie } from '@common/utils/cookie';
import linkifyIt from 'linkify-it';
import tlds from 'tlds';

import { isNumber } from './type';
import { isEmpty } from './object';

const BYPASS_UTM = 'bypass_utm';
const UTM_MEDIUM = 'utm_medium';
const UTM_SOURCE = 'utm_source';

export function normalizeURL(url, forceHTTPS = false) {
  let url2 = url;
  if (!url2.startsWith('http')) {
    url2 = `http${forceHTTPS ? 's' : ''}://${url2}`;
  }

  return url2;
}

export function isValidURL(url) {
  // eslint-disable-next-line
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

  return !!url.match(urlRegex);
}

export function urlJoin(...parts) {
  const normalizedParts = parts.map(part => {
    if (isNumber(part)) {
      return String(part);
    } else {
      return part;
    }
  }).filter(Boolean);
  return _urlJoin(...normalizedParts);
}

/**
 * @param {Array} parts Parts of the url
 * @param {Object} params Query or search params to be added in the url
 * @returns {String} The final url
 */
export function urlJoinWithQueryParams(parts, params) {
  let path = urlJoin(...parts);
  if (params && Object.keys(params).length > 0) {
    path
      += `?${qs.stringify(params, { skipNull: true, skipEmptyString: true })}`;
  }
  return path;
}

export function urlOriginPlusPathname() {
  return window.location.origin + window.location.pathname;
}

export function getURLWithUTMParams() {
  let pageUrl = window.location.href;
  const utmQuery = getCookie(BYPASS_UTM);
  if (
    !pageUrl.includes(UTM_MEDIUM)
    && !pageUrl.includes(UTM_SOURCE)
    && utmQuery
  ) {
    const nonUtmQuery = window.location.search;
    pageUrl += nonUtmQuery ? `&${utmQuery}` : `?${utmQuery}`;
  }
  return pageUrl;
}

export function getUTMPropagationParams() {
  const utmParams = window.TrackingHelper?.getContext(
    'utm_propagation_params'
  ) || {};
  if (!isEmpty(utmParams)) return utmParams;

  const utmQuery = getCookie(BYPASS_UTM);
  if (utmQuery) {
    const params = utmQuery.split('&');
    if (params) {
      params.forEach(param => {
        const [key, value] = param.split('=');

        utmParams[key] = value;
      });
    }
  }
  window.TrackingHelper?.setContext('utm_propagation_params', utmParams);

  return utmParams;
}

export function openInNewTab(url) {
  window.open(url, '_blank').focus();
}

const linkify = linkifyIt().tlds(tlds);

export function isValidLink(url) {
  return linkify.test(url);
}
