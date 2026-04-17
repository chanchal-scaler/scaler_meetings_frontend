import React, {
  useCallback, useEffect, useState,
} from 'react';
import { useNavigate, useBlocker, matchPath } from 'react-router';

const withCustomPrompt = (Component) => (props) => {
  const { whitelistUrls } = props;
  const navigate = useNavigate();

  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  const containsUrl = useCallback((pathValue) => whitelistUrls.some(
    url => matchPath({ path: url, end: true }, pathValue),
  ), [whitelistUrls]);

  const blocker = useBlocker(({ nextLocation }) => {
    if (containsUrl(nextLocation.pathname)) {
      return false;
    }
    setCurrentPath(nextLocation.pathname);
    setShowPrompt(true);
    return true;
  });

  useEffect(() => {
    if (blocker.state === 'blocked' && containsUrl(blocker.location?.pathname)) {
      blocker.proceed();
    }
  }, [blocker, containsUrl]);

  const handleSubmit = useCallback(() => {
    setShowPrompt(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    } else {
      navigate(currentPath);
    }
  }, [currentPath, navigate, blocker]);

  const handleClose = useCallback((route) => {
    setShowPrompt(false);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    if (route) {
      navigate(route, { replace: true });
    }
  }, [navigate, blocker]);

  return showPrompt ? (
    <Component
      {...props}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  ) : null;
};

export default withCustomPrompt;
