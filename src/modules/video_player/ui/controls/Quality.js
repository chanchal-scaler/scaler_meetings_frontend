import React, { useCallback, useState } from 'react';
import classNames from 'classnames';

import {
  Dropdown, DropdownItem, Icon,
} from '@common/ui/general';
import ControlItem from '~video_player/ui/player/ControlItem';
import {
  useActions,
  useGlobalState,
} from '~video_player/hooks';
import { useMediaQuery } from '@common/hooks';

function QualityLevel({ label, level }) {
  const { appliedQuality, selectedQualityLevel } = useGlobalState();
  const { setSelectedQualityLevel } = useActions();
  const isSelected = selectedQualityLevel === level;

  const handleClick = useCallback(() => {
    setSelectedQualityLevel(level);
  }, [level, setSelectedQualityLevel]);

  return (
    <DropdownItem
      className={classNames(
        'vp-dropdown__item',
        { 'vp-dropdown__item--selected': isSelected },
      )}
      onClick={handleClick}
      data-cy="video-player-controls-quality-button"
      gtmEventType="video_quality"
      gtmEventAction="click"
      gtmEventResult={label}
      gtmEventCategory="video_player"
    >
      <Icon className="m-r-10" name="tick" />
      {label}
      {
        level === -1
        && isSelected
        && appliedQuality
        && ` (${appliedQuality}p)`
      }
    </DropdownItem>
  );
}

function Quality({ className, ...remainingProps }) {
  const [isOpen, setIsOpen] = useState(false);
  const { mobile } = useMediaQuery();

  const {
    containerEl,
    qualityLevels,
  } = useGlobalState();

  const handleToggle = useCallback(() => setIsOpen(prev => !prev), []);

  if (!mobile && qualityLevels.length > 1) {
    return (
      <Dropdown
        className={classNames(
          'vp-controls__control',
          { [className]: className },
        )}
        component={ControlItem}
        icon="settings"
        popoverProps={{
          className: 'vp-dropdown__popover',
          container: containerEl,
          placement: 'top',
        }}
        titleClassName="vp-dropdown"
        location={{ right: -20, bottom: '125%' }}
        isOpen={isOpen}
        onChange={handleToggle}
        isDisabled={isOpen}
        {...remainingProps}
      >
        {qualityLevels.map((level, index) => (
          <QualityLevel
            key={index}
            label={`${level.height}p`}
            level={index}
          />
        ))}
        <QualityLevel
          label="Auto"
          level={-1}
        />
      </Dropdown>
    );
  } else {
    return null;
  }
}

export default Quality;
