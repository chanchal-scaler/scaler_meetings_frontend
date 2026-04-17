import { matchPath, useLocation } from 'react-router-dom';

function useMatchedParams(
  relativePath,
  options = { exact: false, strict: false },
) {
  const { pathname } = useLocation();
  const details = matchPath(
    { path: relativePath, end: options.exact },
    pathname,
  );
  return details?.params || {};
}

export default useMatchedParams;
