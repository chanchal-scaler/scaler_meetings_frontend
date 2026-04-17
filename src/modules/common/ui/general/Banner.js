import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { componentPropType } from '@common/utils/propTypes';
import { forwardRef } from '@common/ui/hoc';

function Banner({
  className,
  component: Component = 'div',
  iconUrl,
  bannerIcon,
  title,
  body,
  button,
  bannerBodyClassName,
  bannerButtonClassName,
  bannerIconChip,
  bannerIconClassName,
  bannerSubTitleClassName,
  bannerTitleClassName,
  btnDisabled,
  forwardedRef,
  ...remainingProps
}) {
  return (
    <Component
      ref={forwardedRef}
      className={classNames(
        'banner',
        { [className]: className },
      )}
      {...remainingProps}
    >
      <div
        className={classNames(
          'banner__icon',
          { [bannerIconClassName]: bannerIconClassName },
        )}
      >
        {bannerIcon}
        {iconUrl && (
          <img
            src={iconUrl}
            alt="icon"
          />
        )}
        {bannerIconChip}
      </div>
      <div
        className={classNames(
          'banner__body',
          { [bannerBodyClassName]: bannerBodyClassName },
        )}
      >
        <div
          className={classNames(
            'banner__title',
            { [bannerTitleClassName]: bannerTitleClassName },
          )}
        >
          {title}
        </div>
        <div
          className={classNames(
            'banner__subtitle',
            { [bannerSubTitleClassName]: bannerSubTitleClassName },
          )}
        >
          {body}
        </div>
      </div>
      {button && (
        <div
          className={classNames(
            'banner__button',
            { [bannerButtonClassName]: bannerButtonClassName },
          )}
        >
          {button}
        </div>
      )}
    </Component>
  );
}

Banner.propTypes = {
  className: PropTypes.string,
  component: componentPropType,
  iconUrl: PropTypes.node,
  title: PropTypes.node.isRequired,
  body: PropTypes.node,
  button: PropTypes.node,
  bannerIconChip: PropTypes.node,
  bannerBodyClassName: PropTypes.string,
  bannerButtonClassName: PropTypes.string,
  bannerIconClassName: PropTypes.string,
  bannerSubTitleClassName: PropTypes.string,
  bannerTitleClassName: PropTypes.string,
};

export default forwardRef(Banner);
