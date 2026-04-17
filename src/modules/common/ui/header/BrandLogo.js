import React from 'react';

function BrandLogo({
  src,
  href,
  ...remainingProps
}) {
  return (
    <a
      href={href}
      {...remainingProps}
    >
      <img src={src} alt="scaler" />
    </a>
  );
}

export default BrandLogo;
