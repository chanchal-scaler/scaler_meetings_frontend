import React from 'react';

import { NOTICE_BOARD_TYPES } from '~meetings/utils/noticeBoard';
import BannerListTemplate from './templates/BannerListTemplate';
import EventCard from './EventCard';
import DefaultCard from './DefaultCard';

const noticeBoardRenderMap = {
  [NOTICE_BOARD_TYPES.eventCard]: EventCard,
  [NOTICE_BOARD_TYPES.bannerListTemplate]: BannerListTemplate,
  [NOTICE_BOARD_TYPES.default]: DefaultCard,
};

function NoticeBoardCard({
  onDelete, canDelete, message,
}) {
  const {
    notice_board_template_type: templateType,
  } = JSON.parse(message.body) || {};

  const CardComponent = noticeBoardRenderMap[templateType] || DefaultCard;

  return (
    <CardComponent
      onDelete={onDelete}
      canDelete={canDelete}
      message={message}
    />
  );
}

export default NoticeBoardCard;
