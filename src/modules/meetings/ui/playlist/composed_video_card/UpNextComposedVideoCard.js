import React, { useRef } from 'react';

import ComposedVideoDescription from './ComposedVideoDescription';
import ComposedVideoTitle from './ComposedVideoTitle';
import playIcon from '~meetings/images/play-icon.svg';
import StartComposedVideoButton from './StartComposedVideoButton';
import VideoQuickView from '~meetings/ui/playlist/VideoQuickView';
import ViewComposedVideoButton from './ViewComposedVideoButton';

const UpNextComposedVideoCard = ({ content }) => {
  const ref = useRef(null);

  return (
    <>
      <div ref={ref} className="m-up-next-card relative row">
        <div className="m-topic-card__section p-15">
          <div className="row m-b-5 m-topic-card__header">
            <ComposedVideoTitle content={content} />
            <img
              src={playIcon}
              alt="icon"
            />
          </div>
          <ComposedVideoDescription content={content} />
        </div>
        <div className="p-20 m-topic-card__action">
          <StartComposedVideoButton className="m-b-10" content={content} />
          <ViewComposedVideoButton content={content} />
        </div>
      </div>
      <VideoQuickView content={content} />
    </>
  );
};

export default UpNextComposedVideoCard;
