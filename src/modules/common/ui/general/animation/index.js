import React, { lazy } from 'react';

import SuspenseLayout from '@common/ui/layouts/SuspenseLayout';

const LottiePlayer = lazy(() => import('./LottiePlayer'));
export default function LottieAnimation(props) {
  return (
    <SuspenseLayout>
      <LottiePlayer
        autoPlay
        loop
        mode="normal"
        {...props}
      />
    </SuspenseLayout>
  );
}
