import React from 'react';

import NoticeBoard from './NoticeBoard';
import NoticeBoardV2 from './NoticeBoardV2';

function NoticeBoardHandler({ newNoticeBoardEnabled, canAdd, noticeBoard }) {
  if (newNoticeBoardEnabled) {
    return (
      <NoticeBoardV2
        noticeBoard={noticeBoard}
        canAdd={canAdd}
      />
    );
  } else {
    return (
      <NoticeBoard
        noticeBoard={noticeBoard}
        canAdd={canAdd}
      />
    );
  }
}

export default NoticeBoardHandler;
