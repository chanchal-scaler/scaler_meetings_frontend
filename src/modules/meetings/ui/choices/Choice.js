import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { AdvancedMdRenderer } from '@common/ui/markdown';
import { Tappable } from '@common/ui/general';

function Choice({
  className,
  distribution,
  index,
  isCorrect,
  isHighlighted,
  isResponse,
  isSelected,
  isWrong,
  onClick,
  onSelect,
  small,
  text,
  ...remainingProps
}) {
  const [_distribution, setDistribution] = useState(0);

  useEffect(() => {
    if (isResponse) {
      // For animation
      setTimeout(() => {
        setDistribution(distribution || 0);
      }, 180);
    }
  }, [distribution, isResponse]);

  const handleClick = useCallback((event) => {
    if (onSelect) {
      onSelect(index);
    }

    if (onClick) {
      onClick(event);
    }
  }, [index, onClick, onSelect]);

  function nameUi() {
    return (
      <div className="choice__name">
        {String.fromCharCode(65 + index)}
      </div>
    );
  }

  function responseUi() {
    if (isResponse) {
      return (
        <span
          className={classNames(
            'choice__response',
            { 'choice__response--skew': _distribution !== 0 },
          )}
          style={{ width: `calc(${_distribution}% + 1.8rem)` }}
        />
      );
    } else {
      return null;
    }
  }

  function textUi() {
    return (
      <div className="choice__text">
        {responseUi()}
        <AdvancedMdRenderer
          className="relative"
          mdString={text}
          parseCode
          parseMathExpressions
        />
      </div>
    );
  }

  return (
    <Tappable
      className={classNames(
        'choice',
        { 'choice--default': !isWrong && !isCorrect },
        { 'choice--selected': isSelected },
        { 'choice--correct': isCorrect },
        { 'choice--wrong': isWrong },
        { 'choice--locked': isResponse },
        { 'choice--highlighted': isHighlighted },
        { 'choice--small': small },
        { [className]: className },
      )}
      onClick={handleClick}
      {...remainingProps}
    >
      {nameUi()}
      {textUi()}
    </Tappable>
  );
}

Choice.propTypes = {
  distribution: PropTypes.number,
  index: PropTypes.number.isRequired,
  isCorrect: PropTypes.bool,
  isHighlighted: PropTypes.bool,
  isResponse: PropTypes.bool,
  isSelected: PropTypes.bool,
  isWrong: PropTypes.bool,
  onSelect: PropTypes.func,
  small: PropTypes.bool,
  text: PropTypes.string.isRequired,
};

export default Choice;
