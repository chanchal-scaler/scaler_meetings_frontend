import React, { lazy } from 'react';

import { SuspenseLayout } from '@common/ui/layouts/index';

const ChartContainer = lazy(() => import('~charts/ui/ChartContainer'));
const LineChart = lazy(() => import('~charts/ui/LineChart'));
const BarChart = lazy(() => import('~charts/ui/BarChart'));
const RadarChart = lazy(() => import('~charts/ui/RadarChart'));

export function Charts({ ...props }) {
  return (
    <SuspenseLayout>
      <ChartContainer {...props} />
    </SuspenseLayout>
  );
}

export function LineChartContainer({ ...props }) {
  return (
    <SuspenseLayout>
      <LineChart {...props} />
    </SuspenseLayout>
  );
}

export function BarChartContainer({ ...props }) {
  return (
    <SuspenseLayout>
      <BarChart {...props} />
    </SuspenseLayout>
  );
}

export function RadarChartContainer({ ...props }) {
  return (
    <SuspenseLayout>
      <RadarChart {...props} />
    </SuspenseLayout>
  );
}
