import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function Suggestion({
  className,
  title,
  list,
  // eslint-disable-next-line no-unused-vars
  ...remainingProps
}) {
  return (
    <div
      className={
        classNames(
          'suggestion flex-column border p-20',
          { [className]: className },
        )
      }
    >
      <div className="bold">
        {title}
      </div>
      <ul className="p-10">
        {list.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

Suggestion.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  list: PropTypes.array,
};

export default Suggestion;
