import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';

import {
  Avatar, Icon, Tappable, Tooltip,
} from '@common/ui/general';
import { HintLayout } from '@common/ui/layouts';
import { MdRenderer } from '@common/ui/markdown';
import { useMediaQuery } from '@common/hooks';

const rankStrings = ['first', 'second', 'third'];

const congratsMessageMap = {
  topper: ':tada: Congrats! You made it to the Winner\'s Podium',
  normal: ':partying_face: Congrats! You made it to the Leaderboard',
};

const MAX_LEADERBOARD_ENTRIES = 10;

function Leaderboard({
  isOpen,
  leaderboard,
  myLeaderboardEntry,
  onClose,
  numProblems,
  virtualEntry,
}) {
  const { mobile } = useMediaQuery();

  function scoreUi({ score, solved }) {
    return (
      <div className="row flex-ac">
        <div className="m-leaderboard__count">
          <span className="success bold">{solved}</span>
          <span className="h6 normal no-mgn-b">
            /
            {numProblems}
          </span>
        </div>
        <div className="bolder row flex-ac">
          <Icon
            className="warning m-r-5"
            name="thunder"
          />
          {score.toFixed(2)}
        </div>
      </div>
    );
  }

  function itemUi(item) {
    const isTopper = item.rank <= 3;
    return (
      <div
        key={`${item.userId}${item.rank}`}
        className={classNames(
          'm-leaderboard__item',
          { 'm-leaderboard__item--topper': isTopper },
          { 'm-leaderboard__item--failure': item.rank > 10 },
        )}
      >
        <div className="m-leaderboard__rank m-r-10">
          {item.rank === Infinity ? '-' : item.rank}
        </div>
        <Avatar
          className="m-r-10"
          image={item.participant.avatar}
          size={25}
          title={item.participant.name}
        />
        <div className="m-leaderboard__name">
          {item.participant.name}
          {item.mine ? ' (You)' : ''}
          {isTopper && <Icon className="m-l-5 warning" name="trophy" />}
          {
            item.mine && virtualEntry && (
              <Tooltip
                title="Your Performance metrics from the Live Class"
              >
                <Icon name="info" className="m-l-5" />
              </Tooltip>
            )
          }
        </div>
        {scoreUi(item)}
      </div>
    );
  }

  function topperUi(item) {
    return (
      <div
        key={`${item.userId}${item.rank}`}
        className={classNames(
          'm-leaderboard-topper',
          `m-leaderboard-topper--${rankStrings[item.rank - 1]}`,
        )}
      >
        <div className="m-leaderboard-topper__highlight">
          <Avatar
            className="m-leaderboard-topper__avatar"
            image={item.participant.avatar}
            size={item.rank === 1 ? 80 : 64}
            title={item.participant.name}
          />
          <div className="m-leaderboard-topper__rank">
            {item.rank}
          </div>
        </div>
        <div className="m-leaderboard-topper__name">
          <Icon
            name="trophy"
            className="m-leaderboard-topper__cup m-r-5"
          />
          <span className="ellipsis">
            {item.participant.name}
            {item.mine ? ' (You)' : ''}
          </span>
        </div>
        {scoreUi(item)}
      </div>
    );
  }

  function othersUi() {
    const others = mobile ? leaderboard : leaderboard.slice(3);

    if (
      others.length > 0
      || (
        myLeaderboardEntry
        && myLeaderboardEntry.rank > MAX_LEADERBOARD_ENTRIES
      )
    ) {
      return (
        <div className="m-leaderboard__list scroll">
          {others.map(itemUi)}
          {
            myLeaderboardEntry
            && myLeaderboardEntry.rank > MAX_LEADERBOARD_ENTRIES
            && itemUi(myLeaderboardEntry)
          }
        </div>
      );
    } else {
      return null;
    }
  }

  function listUi() {
    const toppers = [
      leaderboard[1], leaderboard[0], leaderboard[2],
    ].filter(o => Boolean(o));

    if (leaderboard.length === 0) {
      return (
        <HintLayout
          isFit
          message="There's no one yet on leaderboard"
        />
      );
    } else {
      return (
        <div className="m-leaderboard__ranklist">
          {!mobile && (
            <div className="m-leaderboard__toppers">
              {toppers.map(topperUi)}
            </div>
          )}
          {othersUi()}
        </div>
      );
    }
  }

  function headerUi() {
    return (
      <div className="text-c">
        <h3 className="dark bold h2 no-mgn-b">
          {
            virtualEntry ? 'Live Class Leaderboard' : 'Leaderboard'
          }
        </h3>
        <div className="hint h5 no-mgn-b">
          Based on all quizzes from the session
        </div>
      </div>
    );
  }

  function closeUi() {
    return (
      <Tappable
        className="btn btn-icon btn-inverted btn-round m-leaderboard__close"
        gtmEventType="leaderboard_action"
        gtmEventAction="click"
        gtmEventResult="close_leaderboard"
        gtmEventCategory="drona"
        onClick={onClose}
      >
        <Icon name="clear" />
      </Tappable>
    );
  }

  function congratsMessageArchive() {
    if (!virtualEntry || virtualEntry.rank === Infinity) {
      return null;
    }

    const msg = `Practice Rank: ${virtualEntry.rank} \
     | Score: ${virtualEntry.score} \
     | Problems Solved: ${virtualEntry.solved}/${numProblems}`;

    if (virtualEntry && virtualEntry.rank <= 10) {
      return `${msg}
       :dancer: Congrats! You could've made it to the Live Leaderboard`;
    }
    return msg;
  }

  function congratsMessageLive() {
    if (isEmpty(myLeaderboardEntry) || myLeaderboardEntry.rank > 10) {
      return null;
    }

    const type = myLeaderboardEntry.rank <= 3 ? 'topper' : 'normal';
    return congratsMessageMap[type];
  }

  function congratsUi() {
    if (!(!isEmpty(myLeaderboardEntry) || virtualEntry)) {
      return null;
    }

    const liveMsg = congratsMessageLive();
    const archiveMsg = congratsMessageArchive();
    const msg = archiveMsg || liveMsg;

    if (!msg) {
      return null;
    }

    return (
      <div className="m-leaderboard__message">
        <MdRenderer mdString={msg} />
      </div>
    );
  }

  if (isOpen) {
    return (
      <div className="m-leaderboard layout">
        {closeUi()}
        {headerUi()}
        {listUi()}
        {congratsUi()}
      </div>
    );
  } else {
    return null;
  }
}

Leaderboard.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  leaderboard: PropTypes.array.isRequired,
  myLeaderboardEntry: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  numProblems: PropTypes.number.isRequired,
  virtualEntry: PropTypes.object,
};

export default observer(Leaderboard);
