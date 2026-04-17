import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Tooltip from './Tooltip';

function linkTooltipWrapper(linkTooltip, linkComponent) {
  if (!linkTooltip) {
    return linkComponent;
  }

  return (
    <Tooltip
      title={linkTooltip.title}
      className={linkTooltip.class}
      popoverProps={{ placement: linkTooltip.popoverPlacement }}
    >
      {linkComponent}
    </Tooltip>
  );
}

function linkUi(linkText, linkClass, linkUrl) {
  return (
    <a
      className={classNames(
        'progressbar__checkpoint-link',
        linkClass,
      )}
      href={linkUrl}
    >
      {linkText}
    </a>
  );
}

const CheckPoint = ({
  value,
  bonus,
  min,
  limit,
  icon,
  label,
  text,
  link,
  linkUrl,
  linkClass,
  linkTooltip,
  showValue = true,
  showLine = true,
  iconComponent = null,
  iconClassName,
  wrapperClassName,
  textClassName,
  textHeader = null,
  impTag = false,
}) => {
  const width = ((value - min) / (limit - min)) * 100;
  const linkUiComponent = linkUi(link, linkClass, linkUrl);

  return (
    <div className="progressbar__checkpoint" style={{ left: `${width}%` }}>
      <div
        className={classNames(
          'progressbar__checkpoint-wrapper', wrapperClassName,
        )}
      >
        {label && (
          <div className="progressbar__checkpoint-label m-b-10">
            {label}
            {impTag && (<span className="p-l-5 danger">**</span>)}
          </div>
        )}
        {Boolean(iconComponent) && iconComponent}
        {icon && (
          <img
            className={classNames(
              'progressbar__checkpoint-icon', iconClassName,
            )}
            src={icon}
            alt={icon}
          />
        )}
        {bonus && <span>{`${bonus * 100}%`}</span>}
        {showLine ? <div className="progressbar__checkpoint-mark" /> : ''}
        {showValue ? <span>{value}</span> : ''}
        {text && (
          <div
            className={classNames(
              'progressbar__checkpoint-text', textClassName,
            )}
          >
            {textHeader && (
              <div className="progressbar__checkpoint-header">
                {textHeader}
              </div>
            )}
            {text}
          </div>
        )}
        {link && (
          linkTooltipWrapper(linkTooltip, linkUiComponent)
        )}
      </div>
    </div>
  );
};


/*
  Creates linear gradient values based on given checkpoints
  e.g. colors=[c1, c2, c3] and values=[v1, v2, v3]
  linear-gradient requires them to be arranged in following way
  "c1 v1%, c2 v1%, c2 v2%, c3 v2%, c3 v3%"
*/
const gradientCheckpoints = (coloredCheckpoints, total) => {
  const colors = coloredCheckpoints.colors.flatMap((color, idx) => {
    if (idx === 0) {
      return color;
    }

    return [color, color];
  });

  let currentSum = 0;
  const finalValues = coloredCheckpoints.values.flatMap((value, idx) => {
    currentSum += value;
    const percentageValue = (currentSum * 100) / total;

    if (idx === coloredCheckpoints.values.length - 1) {
      return percentageValue;
    }

    return [percentageValue, percentageValue];
  });

  return colors.map((color, idx) => `${color} ${finalValues[idx]}%`).join(',');
};

function Progressbar({
  className,
  min = 0,
  value,
  limit,
  renderValue = true,
  progressbarClassName,
  orientation = 'horizontal',
  checkpoints,
  showProgressLimit = true,
  minProgressWidth,
  coloredCheckpoints,
  ...remainingProps
}) {
  const widthPercent = ((value - min) / (limit - min)) * 100;
  const minWidth = minProgressWidth || '2.5rem';
  const isHorizontal = orientation === Progressbar.orientation.horizontal;

  function orientationStyle() {
    return isHorizontal
      ? {
        width:
            renderValue && widthPercent < 8
              ? minWidth
              : `${String(widthPercent)}%`,
      }
      : {
        width: '1.3rem',
        height:
            renderValue && widthPercent < 8
              ? '1.5rem'
              : `${String(widthPercent)}%`,
      };
  }

  const progressbarStyle = {
    ...orientationStyle(),
    display: !renderValue && widthPercent === 0 ? 'none' : 'block',
    background: coloredCheckpoints && `
      linear-gradient(
        ${isHorizontal ? '90deg' : '0deg'},
        ${gradientCheckpoints(coloredCheckpoints, value)}
      )
    `,
  };

  return (
    <div
      className={classNames('progressbar', { [className]: className })}
      {...remainingProps}
    >
      {checkpoints
        && checkpoints.length > 0
        && checkpoints.map((checkpoint) => (
          <CheckPoint
            key={checkpoint.threshold}
            value={checkpoint.threshold}
            bonus={checkpoint.amount}
            min={min}
            limit={limit}
            icon={checkpoint.icon}
            label={checkpoint.label}
            text={checkpoint.text}
            link={checkpoint.link}
            linkUrl={checkpoint.linkUrl}
            linkClass={checkpoint.linkClass}
            linkTooltip={checkpoint.linkTooltip}
            showValue={checkpoint.showValue}
            showLine={checkpoint.showLine}
            iconComponent={checkpoint.iconComponent}
            iconClassName={checkpoint.iconClassName}
            wrapperClassName={checkpoint.wrapperClassName}
            textClassName={checkpoint.textClassName}
            textHeader={checkpoint.textHeader}
            impTag={checkpoint.impTag}
          />
        ))}
      <div
        className={classNames('progressbar__color', {
          [progressbarClassName]: progressbarClassName,
        })}
        style={progressbarStyle}
      >
        {renderValue ? value : null}
      </div>
      {showProgressLimit && widthPercent < 100 ? (
        <div className="progressbar__limit">{limit}</div>
      ) : null}
    </div>
  );
}

Progressbar.orientation = Object.freeze({
  horizontal: 'horizontal',
  vertical: 'vertical',
});

Progressbar.propTypes = {
  className: PropTypes.string,
  renderValue: PropTypes.bool,
  orientation: PropTypes.oneOf(Object.keys(Progressbar.orientation)),
  value: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  showProgressLimit: PropTypes.bool,
  coloredCheckpoints: PropTypes.object,
};

export default Progressbar;
