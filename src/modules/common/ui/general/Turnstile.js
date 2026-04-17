import React, { useCallback, useEffect } from 'react';

export function resetTurnstile(widgetId) {
  const event = new CustomEvent(
    'reset-turnstile',
    {
      detail: {
        id: widgetId,
        trackTurnstileResponse: true,
      },
    },
  );

  document.dispatchEvent(event);
}

function Turnstile({
  widgetId,
  action,
  onVerify,
  ...rest
}) {
  const loadTurnstile = useCallback(() => {
    window.loadTurnstile(
      widgetId,
      {
        callbackFn: onVerify,
      },
    );
  }, [onVerify, widgetId]);

  useEffect(() => {
    if (window.turnstileState === 'ready') {
      loadTurnstile();
    } else {
      document.addEventListener(
        'turnstile_ready',
        loadTurnstile,
        { once: true },
      );
    }

    return () => {
      window.turnstile?.remove(`#${widgetId}`);
      document.removeEventListener('turnstile_ready', loadTurnstile);
    };
  }, [loadTurnstile, widgetId]);

  return (
    <div
      id={widgetId}
      data-action={action}
      {...rest}
    />
  );
}

export default Turnstile;
