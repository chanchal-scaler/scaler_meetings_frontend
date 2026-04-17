const hashRegex = /#.*$/;

function urlPath(url) {
  const regex = /(http[s]?:\/\/)?([^/\s]+\/)(.*)/g;
  const matches = regex.exec(url);
  const pathMatch = (
    (matches && matches[3])
      ? matches[3].split('?')[0].replace(hashRegex, '')
      : ''
  );
  return `/${pathMatch}`;
}

/**
 * @param  {string} search - search param
 * @return {string} return current URL
 */
function currentUrl() {
  return window.location.href.replace(hashRegex, '');
}

/**
 * Page data for overides
 * @typedef {object} PageData
 * @property {string} [title] - Page title
 * @property {string} [url] - Page url
 * @property {string} [path] - Page path
 * @property {string} [search] - Page search
 * @property {string} [width] - Page width
 * @property {string} [height] - Page height
*/

/**
 * Get information about current page
 * @typedef {Function} getPageData
 * @param  {PageData} [pageData = {}] - Page data overides
 * @return {PageData} resolved page data
 */
export const getPageData = (pageData = {}) => {
  const { title, referrer } = document;
  const { location, innerWidth, innerHeight } = window;
  const { hash, search } = location;
  const url = currentUrl(search);
  const page = {
    title,
    url,
    path: urlPath(url),
    hash,
    search,
    width: innerWidth,
    height: innerHeight,
  };
  if (referrer && referrer !== '') {
    page.referrer = referrer;
  }

  return {
    ...page,
    /* .page() user overrrides */
    ...pageData,
  };
};
