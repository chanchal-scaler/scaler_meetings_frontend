import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import classNames from 'classnames';

function BarChartContainer({
  data,
  gridVerticalLine,
  gridHorizontalLine,
  legendVerticalAlign,
  legendHorizontalAlign,
  bars = [],
  showAllAxisPoints,
  xAxis,
  yAxis,
  xAxisVal,
  iconType,
  barBackgroundColor,
  children,
  className,
  customTick,
  tickLine = true,
  legendProps,
  childrenClass,
  customTooltip,
  widthOfResponsiveContainer,
  heightOfResponsiveContainer,
  xAxisAngle = 0,
  xAxisDx = 0,
  xAxisDy = 0,
}) {
  return (
    <>
      <div
        className={classNames(
          { 'generic-chart__responsive-container': !className },
          { [className]: className },
        )}
      >
        <div className={classNames({ [childrenClass]: childrenClass })}>
          {children}
        </div>
        <ResponsiveContainer
          width={widthOfResponsiveContainer || '100%'}
          height={heightOfResponsiveContainer || 300}
        >
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid
              vertical={gridVerticalLine}
              horizontal={gridHorizontalLine}
              strokeDasharray="2 2"
            />
            <XAxis
              style={xAxis}
              dataKey={xAxisVal}
              interval={showAllAxisPoints}
              angle={xAxisAngle}
              dx={xAxisDx}
              dy={xAxisDy}
              tick={customTick}
              tickLine={tickLine}
            />
            <YAxis style={yAxis} />
            <Tooltip cursor={false} content={customTooltip} />
            <Legend
              verticalAlign={legendVerticalAlign}
              align={legendHorizontalAlign}
              iconType={iconType || 'plainline'}
              {...legendProps}
            />
            {bars && bars.map((barData, index) => {
              const { dataKey, stroke, name } = barData;
              return (
                <Bar
                  barSize={40}
                  name={name}
                  key={index}
                  dataKey={dataKey}
                  fill={stroke}
                  background={{ fill: `${barBackgroundColor || '#eee'}` }}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default BarChartContainer;
