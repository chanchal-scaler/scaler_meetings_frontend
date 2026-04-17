/**
 * This is a Component for showing tooltip
 * when hover on the data point over the Graph.
 *
 * @param {object} payload - A optional param
 * @param {boll} toolbarSelected- A optional  param
 * @return {React.ReactElement} <Tooltip content={<CustomToolTip />}
 */
import React, { useCallback } from 'react';
import classNames from 'classnames';
import proptypes from 'prop-types';

function CustomToolTip({ payload, toolbarSelected }) {
  const labelUi = useCallback(({ dataKey, value }) => (
    <div key={dataKey}>
      <span className="m-l-5">
        {value}
      </span>
    </div>
  ), []);

  return (
    <div className={classNames(
      'graph-tooltip',
      'graph-tooltip-text',
    )}
    >
      <span className="m-l-5">
        {toolbarSelected}
      </span>
      {payload?.map(data => labelUi(data))}
    </div>
  );
}

CustomToolTip.propTypes = {
  payload: proptypes.arrayOf(proptypes.shape({
    dataKey: proptypes.string,
    color: proptypes.string,
    value: proptypes.oneOfType([proptypes.string, proptypes.number]),
  })),
};

export default CustomToolTip;
