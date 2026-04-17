import React from 'react';
import classNames from 'classnames';

import uiManager from '@common/ui/uiManager';
import MascotEmoji from './MascotEmoji';

function ToastMessage({
  type, mascotBackground, mascotName, title, subtitle,
}) {
  return (
    <div
      className={classNames(
        'mascot-toast-container',
        `mascot-toast-container--${type}`,
      )}
    >
      <MascotEmoji
        small
        background={mascotBackground}
        name={mascotName}
      />
      <div className="mascot-toast-container__content">
        <span
          className="mascot-toast-container__title"
        >
          {title}
        </span>
        {subtitle}
      </div>
    </div>
  );
}

const parseToastData = (data) => ({
  ...data,
  className: 'with-mascot',
  message: <ToastMessage {...data} />,
});

export const toast = {
  show(data) {
    uiManager.emit('toast.open', parseToastData(data));
  },
  hide() {
    uiManager.emit('toast.close');
  },
};
