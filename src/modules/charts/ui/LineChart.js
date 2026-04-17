import React from 'react';
import classNames from 'classnames';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function LineChartContainer({
  data,
  gridVerticalLine,
  gridHorizontalLine,
  legendVerticalAlign,
  legendHorizontalAlign,
  lines = [],
  lineDot,
  showAllAxisPoints,
  xAxis,
  yAxis,
  xAxisVal,
  iconType,
  children,
  className,
  childrenClass,
  widthOfResponsiveContainer,
  heightOfResponsiveContainer,
  xAxisAngle = 0,
  xAxisDx = 0,
  xAxisDy = 0,
  xAxisHeight = 60,
  multiXAxis = false,
  customTooltip,
  multiXAxisTick,
  lineProps,
  customTick,
  legendProps,
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
          height={heightOfResponsiveContainer || 600}
        >
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 25,
            }}
          >
            <CartesianGrid
              strokeDasharray="2 2"
              vertical={gridVerticalLine}
              horizontal={gridHorizontalLine}
            />
            <XAxis
              style={xAxis}
              dataKey={xAxisVal}
              interval={showAllAxisPoints}
              angle={xAxisAngle}
              height={xAxisHeight}
              dx={xAxisDx}
              tick={customTick}
              dy={xAxisDy}
              padding={{ right: 30 }}
            />
            {multiXAxis ? (
              <XAxis
                dataKey={xAxisVal}
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={multiXAxisTick || null}
                height={1}
                xAxisId={1}
                scale="band"
              />
            ) : null}
            <YAxis style={yAxis} />
            <Tooltip content={customTooltip} />
            <Legend
              verticalAlign={legendVerticalAlign}
              align={legendHorizontalAlign}
              iconType={iconType || 'plainline'}
              {...legendProps}
            />
            {lines && lines.map((lineData, index) => {
              const {
                name,
                stroke,
                dataKey,
              } = lineData;
              return (
                <Line
                  key={index}
                  name={name}
                  dataKey={dataKey}
                  stroke={stroke}
                  activeDot={lineDot ? { r: 8 } : null}
                  {...lineProps}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default LineChartContainer;
