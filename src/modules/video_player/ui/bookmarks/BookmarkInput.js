import React, { useCallback } from 'react';
import classNames from 'classnames';

import {
  Chip, Icon, Tappable, Textarea,
} from '@common/ui/general';
import { toCountdown } from '~video_player/utils/date';
import { useMediaQuery } from '@common/hooks';
import HotKey from '@common/lib/hotKey';

function BookmarkInput({
  canEdit,
  className,
  onClose,
  onSubmit,
  time,
  title,
  ...remainingProps
}) {
  const { tablet } = useMediaQuery();

  const handleKeyDown = useCallback((event) => {
    if (tablet) {
      return;
    }

    const hotKey = new HotKey(event);
    if (hotKey.didPress('enter') && !hotKey.didPress('shift+enter')) {
      onSubmit(event);
    }
  }, [onSubmit, tablet]);

  return (
    <div
      className={classNames(
        'vp-bookmark-input',
        { 'vp-bookmark-input--editable': canEdit },
        { [className]: className },
      )}
    >
      <div className="vp-bookmark-input__header">
        <Chip
          className="vp-bookmark-input__chip"
          color="default"
        >
          {toCountdown(time)}
        </Chip>
        <div className="vp-bookmark-input__action">
          {Boolean(onClose) && (
            <Tappable
              className="btn btn-icon btn-dark btn-round btn-small"
              onClick={onClose}
            >
              <Icon name="clear" />
            </Tappable>
          )}
        </div>
      </div>
      <div className="vp-bookmark-input__body">
        <Textarea
          autoFocus
          disabled={!canEdit}
          minRows={3}
          maxRows={10}
          onKeyDown={handleKeyDown}
          value={title}
          {...remainingProps}
        />
      </div>
    </div>
  );
}

export default BookmarkInput;
