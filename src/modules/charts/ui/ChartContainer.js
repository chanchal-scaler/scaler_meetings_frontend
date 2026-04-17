import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';

function ChartContainer({
  data,
  width,
  height,
  margin,
  lines,
  xAxisDataKey,
  xAxisStyle,
  yAxisDatekey,
  yAxisOrientation,
  yAxisStyle,
  yAxisUnit,
}) {
  return (
    <LineChart
      data={data}
      width={width}
      height={height}
      margin={margin}
    >
      {
        lines && lines.map((item, index) => (
          <Line
            key={`line-${index}`}
            type="monotone"
            dataKey={item.dataKey}
            stroke={item.stroke}
            dot={false}
          />
        ))
      }
      <XAxis
        dataKey={xAxisDataKey}
        style={xAxisStyle}
      />
      <YAxis
        dataKey={yAxisDatekey}
        orientation={yAxisOrientation}
        style={yAxisStyle}
        unit={yAxisUnit}
      />
      <CartesianGrid vertical={false} stroke="#ccc" strokeDasharray="5 1" />
    </LineChart>
  );
}

export default ChartContainer;
