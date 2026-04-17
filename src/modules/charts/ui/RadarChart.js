import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  Legend,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';


function RadarChartContainer({
  data,
  polarGridType,
  polarAngleAxisDataKey,
  polarRadiusAxisDomain = [],
  polarRadiusAxisAngle = 0,
  radars,
  radarProps,
  widthOfResponsiveContainer,
  heightOfResponsiveContainer,
  showLegend,
  legendProps,
  chartProps,
  polarAngleAxisStyle,
  containerClass,
  angleAxisTickProps,
  radialAxisLineProps,
  radialAxisTickProps,
}) {
  return (
    <ResponsiveContainer
      width={widthOfResponsiveContainer || '100%'}
      height={heightOfResponsiveContainer || '100%'}
      className={containerClass}
    >
      <RadarChart
        data={data}
        {
          ...chartProps
        }
      >
        <PolarGrid gridType={polarGridType} />
        <PolarAngleAxis
          dataKey={polarAngleAxisDataKey}
          style={polarAngleAxisStyle}
          tick={angleAxisTickProps}
        />
        <PolarRadiusAxis
          angle={polarRadiusAxisAngle}
          domain={polarRadiusAxisDomain}
          tick={radialAxisTickProps}
          axisLine={radialAxisLineProps}
        />
        {
          radars && radars.map(({
            stroke,
            fill,
            fillOpacity,
            dataKey,
            name,
            strokeDasharray,
            strokeWidth,
          }, index) => (
            <Radar
              key={index}
              stroke={stroke}
              fill={fill}
              fillOpacity={fillOpacity}
              dataKey={dataKey}
              name={name}
              strokeDasharray={strokeDasharray}
              strokeWidth={strokeWidth}
              {...radarProps}
            />
          ))
        }
        {
          showLegend && <Legend {...legendProps} />
        }
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default RadarChartContainer;
