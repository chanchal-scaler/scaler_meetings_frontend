import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { abbreviate, normalize } from '@common/utils/string';

const minColorIntensity = 0;
const maxColorIntensity = 100;

function findNormalizedValue(value, size) {
  // istanbul ignore next
  if (!value) {
    return minColorIntensity;
  }

  const min = 97 * size;
  const max = 122 * size;
  const numValue = value.split('').reduce((p, c) => (p + c.charCodeAt(0)), 0);

  const normalizedValue = ((numValue - min) * 100) / (max - min);
  return Math.min(
    maxColorIntensity,
    Math.max(minColorIntensity, normalizedValue),
  );
}

function generateColor(title) {
  try {
    const normalizedTitle = normalize(title) || 'u';
    const size = Math.ceil(normalizedTitle.length / 3);
    const chunks = normalizedTitle.match(new RegExp(`.{1,${size}}`, 'g'));
    const r = findNormalizedValue(chunks[0], size);
    const g = findNormalizedValue(chunks[1], size);
    const b = findNormalizedValue(chunks[2], size);
    return `rgba(${r}, ${g}, ${b})`;
  } catch (error) {
    return 'rgb(220,220,220)';
  }
}

function Avatar({
  className,
  fallbackClassName,
  image,
  size = 40,
  style,
  title = 'User',
  numberOfCharacter = 2,
  ...remainingProps
}) {
  const [isLoaded, setLoaded] = useState(false);
  const [isError, setError] = useState(false);

  const handleLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
  }, []);

  function imageUi() {
    if (image) {
      return (
        <div
          className={classNames(
            'avatar__image',
            { 'avatar__image--hidden': !isLoaded || isError },
          )}
        >
          <img
            alt={title}
            onLoad={handleLoaded}
            onError={handleError}
            src={image}
          />
        </div>
      );
    } else {
      return null;
    }
  }

  function fallbackUi() {
    return (
      <div
        className={classNames(
          'avatar__fallback',
          { [fallbackClassName]: fallbackClassName },
        )}
        style={{
          backgroundColor: generateColor(title),
          fontSize: `${size / 2}px`,
        }}
      >
        {abbreviate(title, '', numberOfCharacter)}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'avatar',
        { [className]: className },
      )}
      style={{
        ...style,
        width: `${size}px`,
        height: `${size}px`,
      }}
      {...remainingProps}
    >
      {fallbackUi()}
      {imageUi()}
    </div>
  );
}

Avatar.protoTypes = {
  className: PropTypes.string,
  fallbackClassName: PropTypes.string,
  image: PropTypes.string,
  size: PropTypes.number.isRequired,
  numberOfCharacter: PropTypes.number,
  style: PropTypes.object,
  title: PropTypes.string.isRequired,
};

export default Avatar;
