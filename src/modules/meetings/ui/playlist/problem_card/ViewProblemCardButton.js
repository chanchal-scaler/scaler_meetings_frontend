import React from 'react';

import eyeIcon from '~meetings/images/white-eye.svg';
import { PLAYLIST_CONTENT_TYPES } from '~meetings/utils/playlist';
import { Tappable } from '@common/ui/general';

const ViewProblemCardButton = ({ content }) => (
  <Tappable
    className="p-20"
    onClick={() => content.setQuickViewOpen(true)}
  >
    <div className="row m-up-next-card__start">
      <img
        src={eyeIcon}
        alt="Eye icon"
      />
      <div className="h5 m-l-10 m-t-3">
        View
        {content.type === PLAYLIST_CONTENT_TYPES.problem ? ' Quiz ' : ' Poll '}
      </div>
    </div>
  </Tappable>
);

export default ViewProblemCardButton;
