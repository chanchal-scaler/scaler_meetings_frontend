import React, { lazy } from 'react';

import SuspenseLayout from '@common/ui/layouts/SuspenseLayout';

const LottiePlayer = lazy(() => import('./LottieAnimationV2'));
export default function LottiePlayerV2(props) {
  return (
    <SuspenseLayout>
      <LottiePlayer {...props} />
    </SuspenseLayout>
  );
}
