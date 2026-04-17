import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function CircularProgressbar({
  percentage,
  changePercentage,
  width = 200,
  strokeWidth = 5,
  pathColor = '#e5ecf9',
  progressColor = '#1978dd',
  changeColors = ['#42bd83', '#e4526b'],
  fill = 'transparent',
  strokeLinecap = 'round',
  parentClassName,
  children,
}) {
  const Pi = Math.PI;
  const radius = width / 2 - strokeWidth * 2;
  const circumference = 2 * Pi * radius;

  const offset = circumference - (percentage / 100) * circumference;
  const offsetEndAngle = (360 / 100) * percentage;

  const changeOffset = changePercentage && (
    circumference - (changePercentage / 100) * circumference
  );
  const changeStartAngle = offsetEndAngle - 90;

  return (
    <div
      className={classNames(
        'c-progress__parent-container',
        { [`${parentClassName}`]: parentClassName },
      )}
      style={{ height: `${width}px`, width: `${width}px` }}
    >
      <div className="c-progress__child-container">
        <div
          className="c-progress__child-circle"
          style={{
            width: `${0.16 * radius}rem`,
            height: `${0.16 * radius}rem`,
          }}
        >
          {children}
        </div>
      </div>
      <svg
        width="100%"
        height="100%"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="c-progress__circle"
          cx={width / 2}
          cy={width / 2}
          fill={fill}
          r={radius}
          stroke={pathColor}
          strokeDasharray={`${circumference}`}
          strokeLinecap={strokeLinecap}
          strokeWidth={strokeWidth}
        />
        <circle
          className="c-progress__circle c-progress__circle--percentage"
          cx={width / 2}
          cy={width / 2}
          fill={fill}
          r={radius}
          stroke={progressColor}
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap={strokeLinecap}
          strokeWidth={strokeWidth}
        />
        {changePercentage && (
          <circle
            className="c-progress__circle"
            cx={width / 2}
            cy={width / 2}
            fill={fill}
            r={radius}
            stroke={changePercentage > 0 ? changeColors[0] : changeColors[1]}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={changeOffset}
            strokeLinecap={strokeLinecap}
            strokeWidth={strokeWidth}
            style={{
              transform: `rotate(${changeStartAngle}deg)`,
            }}
          />
        )}
      </svg>
    </div>
  );
}


CircularProgressbar.propTypes = {
  percentage: PropTypes.number.isRequired,
  changePercentage: PropTypes.number,
  width: PropTypes.number,
  strokeWidth: PropTypes.number,
  strokeLinecap: PropTypes.oneOf(['round', 'square', 'butt']),
  progressColor: PropTypes.string,
  pathColor: PropTypes.string,
  changeColors: PropTypes.array,
  fill: PropTypes.string,
  parentClassName: PropTypes.string,
};

export default CircularProgressbar;
