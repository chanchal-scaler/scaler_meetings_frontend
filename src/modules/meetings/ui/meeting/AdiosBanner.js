import React from 'react';
import classNames from 'classnames';

import { Tappable } from '@common/ui/general';

const buttonUi = (buttonData) => {
  if (!buttonData) {
    return null;
  }

  return (
    <Tappable
      component="a"
      href={buttonData.link}
      className="adios-banner__btn"
    >
      {buttonData.text}
    </Tappable>
  );
};

function AdiosBanner({
  bannerData,
  className,
  showButton,
  ...remainingProps
}) {
  const bannerStyle = {
    backgroundColor: bannerData.background_color,
    color: bannerData.color,
  };

  return (
    <div
      className={classNames(
        'adios-banner',
        { [className]: className },
      )}
      style={bannerStyle}
      {...remainingProps}
    >
      <div className="row align-c p-10">
        <img
          className="adios-banner__icon m-r-10"
          src={bannerData.icon_url}
          alt="banner-icon"
        />
        <div>
          {bannerData.text}
        </div>
      </div>
      <div className="row justify-c">
        {showButton && buttonUi(bannerData.button)}
      </div>
    </div>
  );
}

export default AdiosBanner;
