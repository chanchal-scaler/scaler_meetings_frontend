import React from 'react';
import {
  Area,
  CartesianGrid,
  AreaChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

import { AxisTick } from '@common/ui/general/charts';

function AreaChartContainer({
  data,
  gridStopColor = '#fc9100',
  isGridVertical = true,
  gridStrokeColor = '#e6dee5',
  gridStopOpacity = 0.5,
  gridStrokeWidth = 0.5,
  gridStrokeDasharray = '3 3',
  xAxisWidth = 10,
  xAxisPadding = { right: 45 },
  xAxisdateKey = 'logged_datetime',
  xAxisStroke = 'none',
  xAxisTickComponent,
  yAxisWidth = 25,
  yAxisStroke = 'none',
  yAxisTickComponent,
  yAxisType = 'number',
  yAxisDomain = [0, 100],
  tooltipComponent,
  areaDateKey = 'units',
  areaFillGradient = 'url(#gradientId)',
  areaActiveDot = true,
  areaDot = true,
  isAnimationActive = true,
  areaStroke = '#006DD9',
  areaStrokeWidth = 1,
  areaChartType = 'linear',
  isStreakGradientVisible,
  isStreakReferenceLineVisible,
  referenceLineUnit,
}) {
  return (
    <ResponsiveContainer>
      <AreaChart
        data={data}
      >
        <CartesianGrid
          stopColor={gridStopColor}
          vertical={isGridVertical}
          stopOpacity={gridStopOpacity}
          stroke={gridStrokeColor}
          strokeWidth={gridStrokeWidth}
          strokeDasharray={gridStrokeDasharray}
        />
        <XAxis
          width={xAxisWidth}
          padding={xAxisPadding}
          dataKey={xAxisdateKey}
          stroke={xAxisStroke}
          tick={xAxisTickComponent
              || <AxisTick fontSize={12} textAnchor="start" />}
          interval={0}
        />
        <YAxis
          width={yAxisWidth}
          stroke={yAxisStroke}
          tick={yAxisTickComponent
              || <AxisTick fontSize={12} textAnchor="end" />}
          type={yAxisType}
          domain={yAxisDomain}
        />
        <Tooltip content={tooltipComponent} />
        <Area
          dataKey={areaDateKey}
          fill={areaFillGradient}
          activeDot={areaActiveDot}
          dot={areaDot}
          isAnimationActive={isAnimationActive}
          stroke={areaStroke}
          strokeWidth={areaStrokeWidth}
          type={areaChartType}
        />
        {
          isStreakGradientVisible && (
            <defs>
              <linearGradient
                id="gradientId"
                x1="202.348"
                y1="10.5252"
                x2="202.348"
                y2="139.976"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#006bd754" />
                <stop offset="1" stopColor="#016AD3" stopOpacity="0" />
              </linearGradient>
            </defs>
          )
        }
        {
          isStreakReferenceLineVisible && (
            <ReferenceLine
              y={referenceLineUnit}
              stroke="#20A164"
              strokeDasharray="3 3"
            />
          )
        }
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default AreaChartContainer;
