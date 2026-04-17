import React, { useRef } from 'react';
import classNames from 'classnames';

import ContentTitle from '~meetings/ui/playlist/cue_card/CueCardTitle';
import ContentDescription
  from '~meetings/ui/playlist/cue_card/CueCardDescription';
import CueCardQuickViewPopover from '../CueCardQuickViewPopover';
import StartCueCardButton from './StartCueCardButton';
import topicIcon from '~meetings/images/topic-icon.svg';
import ViewCueCardButton from './ViewCueCardButton';

const UpNextCueCard = ({ content }) => {
  const canControlPlaylist = content?.playlist?.meeting?.canControlPlaylist;
  const ref = useRef();
  return (
    <>
      <div
        ref={ref}
        className={classNames(
          'm-up-next-card relative row',
          { 'm-up-next-card__audience': !canControlPlaylist },
        )}
      >
        <div className={classNames(
          'm-topic-card__section p-15',
        )}
        >
          <div className="row m-b-10 m-topic-card__header">
            <ContentTitle content={content} />
            <img
              src={topicIcon}
              alt="icon"
            />
          </div>
          <ContentDescription content={content} />
        </div>
        <div className={classNames(
          'p-20 m-topic-card__action',
          { 'm-topic-card__hide': !canControlPlaylist },
        )}
        >
          <StartCueCardButton content={content} />
          <ViewCueCardButton content={content} />
        </div>
      </div>
      <CueCardQuickViewPopover
        content={content}
        parentRef={ref}
      />
    </>
  );
};

export default UpNextCueCard;
