import React, { Suspense } from 'react';

export default function SuspenseLayout({ children, fallback = null }) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}
