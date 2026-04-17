import React, { useEffect, useCallback } from 'react';

function Recaptcha({
  sitekey,
  action,
  callback,
}) {
  const handleLoaded = useCallback(() => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(sitekey, { action })
        .then(token => {
          callback(token);
        });
    });
  }, [action, callback, sitekey]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${sitekey}`;
    script.addEventListener('load', handleLoaded);
    document.body.appendChild(script);
  }, [handleLoaded, sitekey]);


  return (
    <div
      className="g-recaptcha lazy-recaptcha-v3 g-recaptcha-custom"
      data-sitekey={sitekey}
      data-action={action}
      data-badge="inline"
      data-size="invisible"
    />
  );
}

export default Recaptcha;
