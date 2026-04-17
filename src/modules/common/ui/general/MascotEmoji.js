import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import AlertCharacter from '@common/images/svg/mascot/alert.svg';
import CharacterBlueBg from '@common/images/svg/mascot/bg-blue.svg';
import CharacterGreenBg from '@common/images/svg/mascot/bg-green.svg';
import CharacterPinkBg from '@common/images/svg/mascot/bg-pink.svg';
import CharacterPuzzledBg from '@common/images/svg/mascot/bg-puzzled.svg';
import CharacterRedBg from '@common/images/svg/mascot/bg-red.svg';
import CharacterYellowBg from '@common/images/svg/mascot/bg-yellow.svg';
import HappyCharacter from '@common/images/svg/mascot/happy.svg';
import HourGlassCharacter from '@common/images/svg/mascot/hour-glass.svg';
import LockedCharacter from '@common/images/svg/mascot/locked.svg';
import LoveCharacter from '@common/images/svg/mascot/love.svg';
import SearchingAgainCharacter from
  '@common/images/svg/mascot/PandaSearchTwo.svg';
import ThankingCharacter from '@common/images/svg/mascot/PandaThankYou.svg';
import PuzzledCharacter from '@common/images/svg/mascot/puzzled.svg';
import SadCharacter from '@common/images/svg/mascot/sad.svg';
import SearchingCharacter from '@common/images/svg/mascot/searching.svg';
import StudyCelebrationCharacter from
  '@common/images/svg/mascot/StudyCelebration.svg';
import StudyingCharacter from '@common/images/svg/mascot/studying.svg';
import UnlockedCharacter from '@common/images/svg/mascot/unlocked.svg';
import WinnerCharacter from '@common/images/svg/mascot/winner.svg';

const mascotMapping = {
  happy: HappyCharacter,
  sad: SadCharacter,
  studying: StudyingCharacter,
  love: LoveCharacter,
  searching: SearchingCharacter,
  alert: AlertCharacter,
  locked: LockedCharacter,
  unlocked: UnlockedCharacter,
  puzzled: PuzzledCharacter,
  hour_glass: HourGlassCharacter,
  searching_two: SearchingAgainCharacter,
  thank_you: ThankingCharacter,
  study_celebration: StudyCelebrationCharacter,
  winner: WinnerCharacter,
};

const backgroundMapping = {
  yellow: CharacterYellowBg,
  red: CharacterRedBg,
  blue: CharacterBlueBg,
  green: CharacterGreenBg,
  pink: CharacterPinkBg,
  puzzled: CharacterPuzzledBg,
  transparent: null,
};

/**
 *
 * @param {String} background background bubble color for Mascot
 * @param {String} className className for Mascot emoji
 * @param {String} name Mascot type
 */

function MascotEmoji({
  background,
  className,
  name,
  small,
  medium,
  large,
  xSmall,
  xLarge,
}) {
  return (
    <div className={classNames(
      'mascot-emoji',
      { 'mascot-emoji--small': small },
      { 'mascot-emoji--medium': medium },
      { 'mascot-emoji--large': large },
      { 'mascot-emoji--x-small': xSmall },
      { 'mascot-emoji--x-large': xLarge },
      { [className]: className },
    )}
    >
      {(background !== 'transparent') ? (
        <img
          className="mascot-emoji__bg"
          src={backgroundMapping[background]}
          alt="character background"
        />
      ) : null}
      <img
        className="mascot-emoji__mascot"
        src={mascotMapping[name]}
        alt="character"
      />
    </div>
  );
}

MascotEmoji.propTypes = {
  background: PropTypes.oneOf(Object.keys(backgroundMapping)).isRequired,
  className: PropTypes.string,
  name: PropTypes.oneOf(Object.keys(mascotMapping)).isRequired,
};

export default MascotEmoji;
