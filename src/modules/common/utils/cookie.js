// * web api https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie

export const getCookie = (cookieName) => {
  if (!cookieName) return undefined;

  const cookies = document.cookie.split(';');
  const gtmCookie = cookies.find(
    row => row.trim().startsWith(`${cookieName}=`),
  );

  /*
  * This handles the case when there are multiple '='
  * in the cookie value. E.g.
  * 'user_analytics_identifier=qdsddwrw=ihihihihihi/ihihi='
  */
  const gtmCookieValue = gtmCookie?.split('=').slice(1).join('=');
  return gtmCookieValue ? decodeURIComponent(gtmCookieValue) : undefined;
};

export const setCookie = (name, value, options = {}) => {
  const cookieOptions = {
    path: '/',
    ...options,
  };

  if (options.expires instanceof Date) {
    cookieOptions.expires = options.expires.toUTCString();
  }

  const cookieName = encodeURIComponent(name);
  const cookieValue = encodeURIComponent(value);
  let updatedCookie = `${cookieName}=${cookieValue}`;

  Object.keys(cookieOptions).forEach((key) => {
    updatedCookie += `; ${key}`;
    updatedCookie += `=${cookieOptions[key]}`;
  });

  document.cookie = updatedCookie;
};

export const deleteCookie = (name) => {
  setCookie(name, '', {
    'max-age': -1,
  });
};
