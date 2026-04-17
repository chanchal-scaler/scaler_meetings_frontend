import React from 'react';

import classNames from 'classnames';
import { Observer, observer } from 'mobx-react';

import { getDeviceType } from '@common/utils/platform';
import { HorizontalScrollView } from '@common/ui/general';
import { useComposedVideoMuteToggle } from '~meetings/hooks';
import { useMediaQuery } from '@common/hooks';
import ContentCard from './ContentCard';
import SkipContainer from './SkipContainer';

function PlaylistScrollViewContent({ playlist }) {
  const { meeting } = playlist;
  const { mobile } = useMediaQuery();

  useComposedVideoMuteToggle(meeting);

  if (getDeviceType() === 'mobile' || mobile) {
    return null;
  } else {
    return (
      <HorizontalScrollView
        step={150}
        className={classNames('row m-10 m-cue-card-container',
          {
            'm-cue-card-container__slide-in': playlist.isVisible,
          },
          {
            'm-cue-card-container__slide-out': !playlist.isVisible,
          })}
        arrowClassNameRight="m-cue-card-container__right-arrow"
        arrowClassNameLeft="m-cue-card-container__left-arrow"
        leftArrowIcon="chevron-left"
        rightArrowIcon="chevron-right"
      >
        {() => (
          <Observer>
            {() => (
              <>
                {
                  playlist.contentList.map((content) => (
                    <ContentCard content={content} key={content.id} />
                  ))
                }
                <SkipContainer />
              </>
            )}
          </Observer>
        )}
      </HorizontalScrollView>
    );
  }
}

export default observer(PlaylistScrollViewContent);
