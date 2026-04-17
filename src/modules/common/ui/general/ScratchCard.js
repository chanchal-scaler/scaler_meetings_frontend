/* eslint-disable arrow-body-style */
import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@common/api/utils';
import PropTypes from 'prop-types';

export const CardUi = ({
  image, points,
  desc, tooltip,
}) => {
  return (
    <>
      <div className="
        scratch-card
        scratch-card__container
        scratch-card__container--center"
      >
        <div className="scratch-card__icontainer">
          <img
            src={image}
            className="scratch-card__img"
            alt="gift"
          />
        </div>
        <h6 className="scratch-card__text">Congrats! You earned</h6>
        <div className="scratch-card__text scratch-card__text--highlight">
          {points}
          &nbsp;Coins
        </div>
      </div>
      { tooltip ? (
        <div className="sc-modal__info">
          Earned for&nbsp;
          <strong>{ desc }</strong>
        </div>
      ) : null}
    </>
  );
};

const ScratchCard = ({
  id, desc, width, height, finishPercent, onComplete,
  coverImg, revealImg, api, res = 5, winnings = null, tooltip = false,
}) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [context, setContext] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [isDrawing, setDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [points, setPoints] = useState(winnings);
  const finished = useRef(false);

  useEffect(() => {
    if (canvasRef.current) {
      const newCanvas = canvasRef.current;
      if (newCanvas) {
        newCanvas.width = width * res;
        newCanvas.height = height * res;
        setCanvas(newCanvas);
      }
      const renderContext = newCanvas.getContext('2d');
      renderContext.scale(res, res);
      setContext(renderContext);
    }
    const canvasImage = new Image(width, height);
    canvasImage.crossOrigin = 'anonymous';
    canvasImage.src = coverImg;
    canvasImage.src += `?q=${Date.now()}`;
    canvasImage.onload = () => {
      if (context) {
        context.drawImage(canvasImage, 0, 0, width, height);
        setLoaded(true);
      }
    };
    if (api === null || api === undefined) {
      finished.current = true;
    }
  }, [context, coverImg, width, height, api, res]);

  const getFilledInPixels = (stride) => {
    let normalizedStride = stride;
    if (!stride || stride < 1) {
      normalizedStride = 1;
    }
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const total = pixels.data.length / normalizedStride;
    let count = 0;
    for (let i = 0; i < pixels.data.length; i += normalizedStride) {
      if (parseInt(pixels.data[i], 10) === 0) {
        count += 1;
      }
    }
    return Math.round((count / total) * 100);
  };

  const getMouse = (event) => {
    const { top, left } = canvas.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    // eslint-disable-next-line max-len
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    return {
      x: (event.pageX || event.touches[0].clientX) - left - scrollLeft,
      y: (event.pageY || event.touches[0].clientY) - top - scrollTop,
    };
  };

  const distanceBetween = (point1, point2) => {
    return Math.sqrt(
      ((point2.x - point1.x) ** 2) + ((point2.y - point1.y) ** 2),
    );
  };

  const angleBetween = (point1, point2) => {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y);
  };

  const handlePercentage = (filledInPixels = 0) => {
    if (filledInPixels >= finishPercent && !finished.current) {
      finished.current = true;
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handleMouseDown = (event) => {
    setDrawing(true);
    setLastPoint(getMouse(event));
    if (points === null) {
      apiRequest('POST', api, { scratch_id: id }).then(response => {
        setPoints(response.points);
        window.scratchPoints = response.points;
        window.scratchId = id;
        window.scratchDesc = desc;
      }).catch(() => {
        setPoints(0);
      });
    }
  };

  const handleMouseMove = (event) => {
    if (!isDrawing) {
      return;
    }

    event.preventDefault();
    const currentPoint = getMouse(event);
    const distance = distanceBetween(lastPoint, currentPoint);
    const angle = angleBetween(lastPoint, currentPoint);

    let x;
    let y;

    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    for (let i = 0; i < distance; i += 1) {
      x = lastPoint.x + (Math.sin(angle) * i);
      y = lastPoint.y + (Math.cos(angle) * i);
      context.arc(x, y, 25, 0, 2 * Math.PI, false);
    }

    context.fill();
    setLastPoint(currentPoint);
    handlePercentage(getFilledInPixels(32));
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    position: 'relative',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    userSelect: 'none',
  };

  const canvasStyle = {
    position: 'absolute',
    zIndex: 1,
    left: '0',
    right: '0',
    height: `${height}px`,
    width: `${width}px`,
  };

  const resultStyle = {
    visibility: loaded ? 'visible' : 'hidden',
  };

  const canvasProps = {
    ref: canvasRef,
    className: 'ScratchCard__Canvas',
    style: canvasStyle,
    onMouseDown: handleMouseDown,
    onTouchStart: handleMouseDown,
    onMouseMove: handleMouseMove,
    onTouchMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onTouchEnd: handleMouseUp,
  };
  if (finished.current || points) {
    return (
      <CardUi
        image={revealImg}
        points={points}
        desc={desc}
        tooltip={tooltip}
      />
    );
  } else {
    return (
      <>
        <div className="scratch-card">
          <div className="ScratchCard__Container" style={containerStyle}>
            <canvas {...canvasProps} />
            <div className="ScratchCard__Result" style={resultStyle}>
              <CardUi image={revealImg} />
            </div>
          </div>
        </div>
        { tooltip ? (
          <div className="sc-modal__info">
            Earned for&nbsp;
            <strong>{ desc }</strong>
          </div>
        ) : null }
      </>
    );
  }
};

ScratchCard.propTypes = {
  coverImg: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  finishPercent: PropTypes.number.isRequired,
  onComplete: PropTypes.func,
  revealImg: PropTypes.string,
};

export default ScratchCard;
