/**
 * This is a Component for showing X, Y axis values in the Graph.
 *
 * @param {number} x - A optional param
 * @param {number} y - A optional  param
 * @param {object} payload - A optional param
 * @param {boll} dateFormat- A optional  param
 * @return {React.ReactElement} tick = {<AxisTick dateFormat >}
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { toDDMMYYYY } from '@common/utils/date';

function AxisTick({
  x, y, payload, dateFormat, fontSize = 14, textAnchor = 'end',
}) {
  const dateFormatter = useCallback((tickItem) => {
    const date = new Date(tickItem);
    const formatedDate = toDDMMYYYY(date);
    return formatedDate;
  }, []);

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor={textAnchor}
        fill="#61738E"
        strokeWidth={3}
        fontWeight={400}
        fontSize={fontSize}
      >
        {dateFormat ? dateFormatter(payload.value) : payload.value}
      </text>
    </g>
  );
}

AxisTick.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  payload: PropTypes.object,
  dateFormat: PropTypes.bool,
};

export default AxisTick;
