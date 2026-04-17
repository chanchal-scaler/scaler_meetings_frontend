import React, { createElement, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {
  Dropdown, DropdownItem, Icon, Tooltip,
} from '@common/ui/general';
import { isNullOrUndefined } from '@common/utils/type';
import {
  useActions,
  useControlsFallback,
  useGlobalState,
} from '~video_player/hooks';

const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const touchProps = {
  location: { top: '100%', right: 0 },
};

const nonTouchProps = {
  placement: 'top',
};

function PlaybackRate({
  className,
  playbackTooltip = null,
  playbackRates = rates,
  ...remainingProps
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isFallback = useControlsFallback();

  const {
    containerEl,
    playbackRate,
  } = useGlobalState();

  const { setPlaybackRate } = useActions();

  const handleToggle = useCallback(() => setIsOpen(prev => !prev), []);

  function titleUi() {
    let component = 'div';
    let componentProps = {};

    if (!isNullOrUndefined(playbackTooltip)) {
      component = Tooltip;
      componentProps = {
        component: 'div',
        title: playbackTooltip,
        isDisabled: isOpen,
        popoverProps: {
          placement: 'top',
        },
      };
    }

    return createElement(component, {
      className: 'vp-playback-title',
      ...componentProps,
    }, (
      <>
        {playbackRate}
        x
      </>
    ));
  }

  function rateUi(rate) {
    return (
      <DropdownItem
        key={rate}
        className={classNames(
          'vp-dropdown__item',
          { 'vp-dropdown__item--selected': rate === playbackRate },
        )}
        onClick={() => setPlaybackRate(rate)}
        gtmEventType="playback_speed"
        gtmEventAction="click"
        gtmEventResult={`${rate}x`}
        gtmEventCategory="video_player"
      >
        <Icon className="m-r-10" name="tick" />
        <span>
          {rate}
          x
        </span>
      </DropdownItem>
    );
  }

  const placementProps = isFallback ? touchProps : nonTouchProps;

  return (
    <Dropdown
      className={classNames(
        'vp-controls__control',
        { [className]: className },
      )}
      popoverProps={{
        className: 'vp-dropdown__popover',
        container: isFallback ? document.body : containerEl,
        ...placementProps,
      }}
      title={titleUi()}
      titleClassName="vp-dropdown"
      isOpen={isOpen}
      data-cy="video-player-controls-playback-rate-button"
      onChange={handleToggle}
      {...remainingProps}
    >
      {playbackRates.map(rateUi)}
    </Dropdown>
  );
}

PlaybackRate.propTypes = {
  playbackTooltip: PropTypes.node,
  playbackRates: PropTypes.arrayOf(PropTypes.number),
};

export default PlaybackRate;
